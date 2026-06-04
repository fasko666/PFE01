<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\PlatformSetting;
use App\Models\TimeLog;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\WeeklyInvoice;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Hourly billing — generates and pays one invoice per active hourly contract
 * per week. Atomic, idempotent, dispute-aware.
 *
 * Flow per contract:
 *   1. Sum approved time_logs in [week_start, week_end]
 *   2. Apply weekly_limit cap if set
 *   3. Compute gross = hours * hourly_rate (cap-respecting)
 *   4. If contract is disputed/cancelled/completed → SKIP entirely
 *   5. If escrow < gross → record invoice as 'failed' with reason and notify
 *   6. Otherwise drain escrow (refundEscrow pattern: contract.escrow -, client.escrow -)
 *      then credit freelancer wallet (minus platform commission)
 *      then write transactions for client/platform/freelancer (same triple-entry
 *      pattern as releaseMilestone)
 *
 * Idempotency: weekly_invoices.idempotency_key = "wk:{contract_id}:{week_start}".
 * Replaying the command is safe — the unique index on (contract_id, week_start)
 * prevents duplicate insertion; if an existing row is `pending` we resume it.
 */
class HourlyBillingService
{
    public function __construct(private LedgerService $ledger) {}

    /**
     * Generate invoices for every active hourly contract whose week ended on
     * or before $upTo. Returns a summary array.
     */
    public function generateForWeekEnding(Carbon $weekEnd, ?int $contractId = null): array
    {
        $weekStart = $weekEnd->copy()->startOfWeek();
        $weekEndDate = $weekEnd->copy()->endOfWeek()->startOfDay();

        $query = Contract::query()
            ->where('type', 'hourly')
            ->whereNotNull('hourly_rate')
            ->where('billing_status', 'active')
            ->whereIn('status', ['active', 'paused']);

        if ($contractId) $query->where('id', $contractId);

        $results = ['processed' => 0, 'paid' => 0, 'failed' => 0, 'skipped' => 0, 'invoices' => []];

        foreach ($query->get() as $contract) {
            $row = $this->generateOneInvoice($contract, $weekStart, $weekEndDate);
            if ($row === null) {
                $results['skipped']++;
            } else {
                $results['processed']++;
                $results['invoices'][] = $row->id;
                if ($row->status === 'paid')   $results['paid']++;
                if ($row->status === 'failed') $results['failed']++;
            }
        }

        return $results;
    }

    /**
     * Generate (or replay) one invoice for one contract.
     * Returns null when the contract is skipped (no hours / cancelled / completed / disputed).
     */
    public function generateOneInvoice(Contract $contract, Carbon $weekStart, Carbon $weekEnd): ?WeeklyInvoice
    {
        // Refuse on terminal or disputed state — escrow is locked there
        if (in_array($contract->status, ['completed', 'cancelled', 'disputed'], true)) {
            return null;
        }

        $key = sprintf('wk:%d:%s', $contract->id, $weekStart->toDateString());

        // Sum hours from approved logs in this week
        $seconds = (int) TimeLog::query()
            ->where('contract_id', $contract->id)
            ->whereNotNull('ended_at')
            ->whereBetween('started_at', [$weekStart, $weekEnd])
            ->sum('duration_seconds');

        if ($seconds <= 0) return null;

        $hours = round($seconds / 3600, 2);

        // Enforce contract weekly_limit cap (in hours)
        if ($contract->weekly_limit && $hours > (float) $contract->weekly_limit) {
            $hours   = (float) $contract->weekly_limit;
            $seconds = (int) ($hours * 3600);
        }

        $rate     = (float) $contract->hourly_rate;
        $gross    = round($hours * $rate, 2);
        $feeRate  = (float) PlatformSetting::get('fee.freelancer_pct', 0.10);
        $fee      = round($gross * $feeRate, 2);
        $net      = round($gross - $fee, 2);

        return DB::transaction(function () use ($contract, $weekStart, $weekEnd, $seconds, $hours, $rate, $gross, $fee, $feeRate, $net, $key) {
            // Idempotent insert — if it exists and is paid, return as-is
            $invoice = WeeklyInvoice::lockForUpdate()
                ->where('idempotency_key', $key)->first();

            if ($invoice && in_array($invoice->status, ['paid', 'cancelled'], true)) {
                return $invoice;
            }

            $invoice = $invoice ?? WeeklyInvoice::create([
                'contract_id'     => $contract->id,
                'client_id'       => $contract->client_id,
                'freelancer_id'   => $contract->freelancer_id,
                'week_start'      => $weekStart->toDateString(),
                'week_end'        => $weekEnd->toDateString(),
                'seconds_worked'  => $seconds,
                'hours_worked'    => $hours,
                'hourly_rate'     => $rate,
                'gross_amount'    => $gross,
                'commission'      => $fee,
                'net_to_freelancer' => $net,
                'status'          => 'pending',
                'idempotency_key' => $key,
            ]);

            // Check escrow — gross must be available
            $contract->refresh();
            if ((float) $contract->escrow_amount < $gross) {
                $invoice->update([
                    'status'         => 'failed',
                    'failure_reason' => "Insufficient escrow: needs \${$gross}, has \${$contract->escrow_amount}",
                    'processed_at'   => now(),
                ]);
                event(new \App\Events\WeeklyInvoiceGenerated($invoice));   // listeners decide who to ping
                return $invoice;
            }

            // Move money — same triple-entry pattern as LedgerService::releaseMilestone
            $clientWallet = Wallet::where('user_id', $contract->client_id)->lockForUpdate()->first();
            $clientWallet->escrow_balance = bcsub((string) $clientWallet->escrow_balance, (string) $gross, 2);
            $clientWallet->save();

            $contract->escrow_amount = bcsub((string) $contract->escrow_amount, (string) $gross, 2);
            $contract->save();

            Transaction::create([
                'wallet_id'       => $clientWallet->id,
                'user_id'         => $contract->client_id,
                'counterparty_user_id' => $contract->freelancer_id,
                'contract_id'     => $contract->id,
                'idempotency_key' => $key . ':client',
                'reference'       => 'WK-' . strtoupper(substr(md5($key), 0, 12)),
                'type'            => 'release',
                'direction'       => 'out',
                'amount'          => $gross,
                'balance_after'   => $clientWallet->balance,
                'status'          => 'completed',
                'description'     => "Hourly billing week of {$weekStart->toDateString()}",
            ]);

            // Platform commission
            if ($fee > 0) {
                $platform = \App\Models\User::where('is_platform', true)->first();
                if ($platform) {
                    $platformWallet = Wallet::where('user_id', $platform->id)->lockForUpdate()->first();
                    $platformWallet->balance = bcadd((string) $platformWallet->balance, (string) $fee, 2);
                    $platformWallet->save();

                    Transaction::create([
                        'wallet_id'       => $platformWallet->id,
                        'user_id'         => $platform->id,
                        'counterparty_user_id' => $contract->freelancer_id,
                        'contract_id'     => $contract->id,
                        'idempotency_key' => $key . ':platform',
                        'reference'       => 'FEE-' . strtoupper(substr(md5($key), 0, 12)),
                        'type'            => 'fee',
                        'direction'       => 'in',
                        'amount'          => $fee,
                        'balance_after'   => $platformWallet->balance,
                        'status'          => 'completed',
                        'description'     => "Hourly billing commission ({$feeRate}) — contract #{$contract->id}",
                    ]);
                }
            }

            // Freelancer credit
            $freelancerWallet = Wallet::where('user_id', $contract->freelancer_id)->lockForUpdate()->first();
            $freelancerWallet->balance = bcadd((string) $freelancerWallet->balance, (string) $net, 2);
            $freelancerWallet->save();

            Transaction::create([
                'wallet_id'       => $freelancerWallet->id,
                'user_id'         => $contract->freelancer_id,
                'counterparty_user_id' => $contract->client_id,
                'contract_id'     => $contract->id,
                'idempotency_key' => $key . ':freelancer',
                'reference'       => 'HRL-' . strtoupper(substr(md5($key), 0, 12)),
                'type'            => 'credit',
                'direction'       => 'in',
                'amount'          => $net,
                'fee'             => $fee,
                'balance_after'   => $freelancerWallet->balance,
                'status'          => 'completed',
                'description'     => "Hourly billing payout — {$hours}h × \${$rate}/hr",
            ]);

            $invoice->update(['status' => 'paid', 'processed_at' => now()]);

            event(new \App\Events\WeeklyInvoiceGenerated($invoice));
            event(new \App\Events\WeeklyInvoicePaid($invoice));

            return $invoice;
        });
    }
}
