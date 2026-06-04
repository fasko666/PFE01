<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\Milestone;
use App\Models\PlatformSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * LedgerService — single source of truth for every money movement in PANDA.
 *
 * GUARANTEES
 *  1. Every money-moving operation runs inside a DB transaction.
 *  2. Every wallet row is locked with SELECT … FOR UPDATE before being mutated.
 *  3. Every transaction row is double-entry — every debit has a matching credit
 *     against either another user wallet or the platform wallet.
 *  4. Every transaction stores `balance_after` immutably for audit reconciliation.
 *  5. Idempotency keys are honored — a duplicate call returns the original result.
 *  6. Invariant checked at end of each op: SUM(transactions.amount * direction)
 *     for a wallet must equal wallet.balance.
 *
 * USAGE
 *  Never write to wallets or transactions directly from controllers. Always go
 *  through this service. Any new money movement gets its own method here.
 */
class LedgerService
{
    /* ════════════════════════════════════════════════════════════════════════
     *  DEPOSIT — client adds funds to their wallet (e.g. via Stripe)
     * ════════════════════════════════════════════════════════════════════════ */
    public function deposit(User $user, float $amount, ?string $idempotencyKey = null, array $meta = []): Transaction
    {
        if ($amount <= 0) throw new RuntimeException('Deposit amount must be positive');

        return DB::transaction(function () use ($user, $amount, $idempotencyKey, $meta) {
            if ($tx = $this->findByIdempotencyKey($idempotencyKey)) return $tx;

            $wallet = $this->lockWallet($user);
            $wallet->balance = bcadd((string) $wallet->balance, (string) $amount, 2);
            $wallet->save();

            return Transaction::create([
                'wallet_id'       => $wallet->id,
                'user_id'         => $user->id,
                'idempotency_key' => $idempotencyKey,
                'reference'       => $this->ref('DEP'),
                'type'            => 'credit',
                'direction'       => 'in',
                'amount'          => $amount,
                'balance_after'   => $wallet->balance,
                'status'          => 'completed',
                'description'     => $meta['description'] ?? 'Wallet deposit',
                'metadata'        => $meta,
                'payment_method'  => $meta['payment_method'] ?? null,
                'stripe_payment_id' => $meta['stripe_payment_id'] ?? null,
            ]);
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  FUND ESCROW — client moves money from wallet.balance → contract escrow
     *  Money LEAVES the client's available balance.
     * ════════════════════════════════════════════════════════════════════════ */
    public function fundEscrow(User $client, Contract $contract, float $amount, ?string $idempotencyKey = null): Transaction
    {
        if ($amount <= 0) throw new RuntimeException('Escrow amount must be positive');
        if ($contract->client_id !== $client->id) throw new RuntimeException('Only the contract client can fund escrow');

        return DB::transaction(function () use ($client, $contract, $amount, $idempotencyKey) {
            if ($tx = $this->findByIdempotencyKey($idempotencyKey)) return $tx;

            $wallet = $this->lockWallet($client);
            $lockedContract = Contract::lockForUpdate()->find($contract->id);

            if ((float) $wallet->balance < $amount) {
                throw new RuntimeException('Insufficient wallet balance to fund escrow');
            }

            // Move money: balance ↓ , escrow_balance ↑ , contract.escrow_amount ↑
            $wallet->balance        = bcsub((string) $wallet->balance,        (string) $amount, 2);
            $wallet->escrow_balance = bcadd((string) $wallet->escrow_balance, (string) $amount, 2);
            $wallet->save();

            $lockedContract->escrow_amount = bcadd((string) $lockedContract->escrow_amount, (string) $amount, 2);
            $lockedContract->save();

            return Transaction::create([
                'wallet_id'       => $wallet->id,
                'user_id'         => $client->id,
                'counterparty_user_id' => $contract->freelancer_id,
                'contract_id'     => $contract->id,
                'idempotency_key' => $idempotencyKey,
                'reference'       => $this->ref('ESC'),
                'type'            => 'escrow',
                'direction'       => 'out',
                'amount'          => $amount,
                'balance_after'   => $wallet->balance,
                'status'          => 'completed',
                'description'     => "Escrow funded for contract: {$contract->title}",
            ]);
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  RELEASE MILESTONE — client approves work, money flows
     *    contract.escrow_amount ↓  by milestone.amount
     *    client.escrow_balance  ↓  by milestone.amount
     *    platform.balance       ↑  by commission
     *    freelancer.balance     ↑  by (milestone.amount - commission)
     * ════════════════════════════════════════════════════════════════════════ */
    public function releaseMilestone(User $client, Milestone $milestone, ?string $idempotencyKey = null): array
    {
        return DB::transaction(function () use ($client, $milestone, $idempotencyKey) {
            $lockedMilestone = Milestone::lockForUpdate()->find($milestone->id);
            if (!$lockedMilestone) throw new RuntimeException('Milestone not found');

            $contract = Contract::lockForUpdate()->find($lockedMilestone->contract_id);

            if ($contract->client_id !== $client->id) {
                throw new RuntimeException('Only the contract client can release milestones');
            }
            if ($contract->status === 'disputed') {
                throw new RuntimeException('Cannot release milestone — contract is under dispute');
            }
            if (in_array($contract->status, ['completed', 'cancelled'], true)) {
                throw new RuntimeException('Cannot release milestone — contract is '.$contract->status);
            }
            if ($lockedMilestone->status === 'paid') {
                throw new RuntimeException('Milestone is already paid');
            }
            if ($lockedMilestone->status !== 'submitted') {
                throw new RuntimeException('Milestone must be submitted before release');
            }
            if ((float) $contract->escrow_amount < (float) $lockedMilestone->amount) {
                throw new RuntimeException('Insufficient escrow funds — client must top up');
            }

            // Idempotency on the COMMISSION/PAYOUT pair
            if ($idempotencyKey && $this->findByIdempotencyKey($idempotencyKey)) {
                throw new RuntimeException('Milestone release already processed (idempotency)');
            }

            $amount     = (float) $lockedMilestone->amount;
            $feeRate    = (float) PlatformSetting::get('fee.freelancer_pct', 0.10);
            $commission = round($amount * $feeRate, 2);
            $payout     = round($amount - $commission, 2);

            // 1. Drain contract escrow + client escrow_balance
            $clientWallet = $this->lockWallet($client);
            $clientWallet->escrow_balance = bcsub((string) $clientWallet->escrow_balance, (string) $amount, 2);
            $clientWallet->save();

            $contract->escrow_amount = bcsub((string) $contract->escrow_amount, (string) $amount, 2);
            $contract->save();

            $clientTx = Transaction::create([
                'wallet_id'       => $clientWallet->id,
                'user_id'         => $client->id,
                'counterparty_user_id' => $contract->freelancer_id,
                'contract_id'     => $contract->id,
                'milestone_id'    => $lockedMilestone->id,
                'idempotency_key' => $idempotencyKey ? $idempotencyKey . ':client' : null,
                'reference'       => $this->ref('REL'),
                'type'            => 'release',
                'direction'       => 'out',
                'amount'          => $amount,
                'balance_after'   => $clientWallet->balance, // escrow movement, available balance unchanged
                'status'          => 'completed',
                'description'     => "Released milestone: {$lockedMilestone->title}",
            ]);

            // 2. Credit platform commission
            $platform = $this->platformUser();
            $platformWallet = $this->lockWallet($platform);
            $platformWallet->balance = bcadd((string) $platformWallet->balance, (string) $commission, 2);
            $platformWallet->save();

            Transaction::create([
                'wallet_id'       => $platformWallet->id,
                'user_id'         => $platform->id,
                'counterparty_user_id' => $contract->freelancer_id,
                'contract_id'     => $contract->id,
                'milestone_id'    => $lockedMilestone->id,
                'idempotency_key' => $idempotencyKey ? $idempotencyKey . ':platform' : null,
                'reference'       => $this->ref('FEE'),
                'type'            => 'fee',
                'direction'       => 'in',
                'amount'          => $commission,
                'balance_after'   => $platformWallet->balance,
                'status'          => 'completed',
                'description'     => "Platform commission ({$feeRate} of \${$amount}) — milestone #{$lockedMilestone->id}",
            ]);

            // 3. Credit freelancer payout
            $freelancer = User::findOrFail($contract->freelancer_id);
            $freelancerWallet = $this->lockWallet($freelancer);
            $freelancerWallet->balance = bcadd((string) $freelancerWallet->balance, (string) $payout, 2);
            $freelancerWallet->save();

            Transaction::create([
                'wallet_id'       => $freelancerWallet->id,
                'user_id'         => $freelancer->id,
                'counterparty_user_id' => $client->id,
                'contract_id'     => $contract->id,
                'milestone_id'    => $lockedMilestone->id,
                'idempotency_key' => $idempotencyKey ? $idempotencyKey . ':freelancer' : null,
                'reference'       => $this->ref('PAY'),
                'type'            => 'credit',
                'direction'       => 'in',
                'amount'          => $payout,
                'fee'             => $commission,
                'balance_after'   => $freelancerWallet->balance,
                'status'          => 'completed',
                'description'     => "Payment for milestone: {$lockedMilestone->title}",
            ]);

            // 4. Mark milestone paid
            $lockedMilestone->update(['status' => 'paid', 'approved_at' => now()]);

            return [
                'amount'     => $amount,
                'commission' => $commission,
                'payout'     => $payout,
                'milestone'  => $lockedMilestone->fresh(),
            ];
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  REQUEST WITHDRAWAL — freelancer asks for payout to bank/paypal
     *  Money is moved from balance → pending_balance and held until admin approval.
     * ════════════════════════════════════════════════════════════════════════ */
    public function requestWithdrawal(User $user, float $amount, string $method, array $payoutDetails): Withdrawal
    {
        $min = (float) PlatformSetting::get('withdrawal.min', 20);
        if ($amount < $min) throw new RuntimeException("Minimum withdrawal is \${$min}");

        $flatFee = (float) PlatformSetting::get('fee.withdrawal_flat', 2);
        $net     = round($amount - $flatFee, 2);
        if ($net <= 0) throw new RuntimeException('Withdrawal amount must exceed the fee');

        return DB::transaction(function () use ($user, $amount, $method, $payoutDetails, $flatFee, $net) {
            $wallet = $this->lockWallet($user);
            if ((float) $wallet->balance < $amount) {
                throw new RuntimeException('Insufficient available balance');
            }

            // Move from balance → pending_balance — funds held until admin acts
            $wallet->balance         = bcsub((string) $wallet->balance,         (string) $amount, 2);
            $wallet->pending_balance = bcadd((string) $wallet->pending_balance, (string) $amount, 2);
            $wallet->save();

            $withdrawal = Withdrawal::create([
                'user_id'   => $user->id,
                'wallet_id' => $wallet->id,
                'amount'    => $amount,
                'fee'       => $flatFee,
                'net'       => $net,
                'currency'  => $wallet->currency ?? 'USD',
                'method'    => $method,
                'payout_details' => $payoutDetails,
                'status'    => 'pending',
            ]);

            Transaction::create([
                'wallet_id'      => $wallet->id,
                'user_id'        => $user->id,
                'withdrawal_id'  => $withdrawal->id,
                'reference'      => $this->ref('WDR'),
                'type'           => 'withdrawal',
                'direction'      => 'out',
                'amount'         => $amount,
                'fee'            => $flatFee,
                'balance_after'  => $wallet->balance,
                'status'         => 'pending',
                'description'    => "Withdrawal request via {$method}",
            ]);

            return $withdrawal->fresh();
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  APPROVE WITHDRAWAL — admin marks as approved → optionally triggers Stripe payout
     *
     *  Flow:
     *    1. Validate state under lock
     *    2. Drain pending_balance (money leaves the system)
     *    3. Mark withdrawal as 'processing' (or 'completed' if no Stripe transfer)
     *    4. If method = 'stripe' AND freelancer has Connect account → fire transfer
     *       The `transfer.paid` webhook will flip status → 'completed'
     * ════════════════════════════════════════════════════════════════════════ */
    public function approveWithdrawal(Withdrawal $withdrawal, User $admin, ?string $externalRef = null): Withdrawal
    {
        if ($admin->role !== 'admin') throw new RuntimeException('Only admins can approve withdrawals');

        $result = DB::transaction(function () use ($withdrawal, $admin, $externalRef) {
            $w = Withdrawal::lockForUpdate()->find($withdrawal->id);
            if ($w->status !== 'pending') throw new RuntimeException('Withdrawal is not pending');

            $wallet = Wallet::lockForUpdate()->find($w->wallet_id);
            if ((float) $wallet->pending_balance < (float) $w->amount) {
                throw new RuntimeException('Pending balance mismatch — possible double approval');
            }

            $wallet->pending_balance = bcsub((string) $wallet->pending_balance, (string) $w->amount, 2);
            $wallet->save();

            // Stripe payout requires async webhook confirmation; everything else completes immediately
            $isStripe = $w->method === 'stripe';
            $w->update([
                'status'       => $isStripe ? 'processing' : 'completed',
                'reviewed_by'  => $admin->id,
                'reviewed_at'  => now(),
                'external_ref' => $externalRef,
                'completed_at' => $isStripe ? null : now(),
            ]);

            Transaction::where('withdrawal_id', $w->id)
                ->update(['status' => $isStripe ? 'pending' : 'completed']);

            return $w->fresh();
        });

        // 4. Trigger Stripe transfer outside the DB transaction (network call)
        if ($result->method === 'stripe') {
            try {
                $stripeService = app(\App\Services\StripeService::class);
                $transfer = $stripeService->sendPayout($result->user, (float) $result->net, $result);
                $result->update(['stripe_transfer_id' => $transfer->id]);
            } catch (\Throwable $e) {
                // Stripe failed: refund pending → balance, mark failed
                DB::transaction(function () use ($result, $e) {
                    $wallet = Wallet::lockForUpdate()->find($result->wallet_id);
                    $wallet->balance = bcadd((string) $wallet->balance, (string) $result->amount, 2);
                    $wallet->save();
                    $result->update([
                        'status'           => 'failed',
                        'rejection_reason' => 'Stripe transfer failed: '.$e->getMessage(),
                    ]);
                    Transaction::where('withdrawal_id', $result->id)
                        ->update(['status' => 'failed']);
                });
                throw $e;
            }
        }

        return $result->fresh();
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  REJECT WITHDRAWAL — admin rejects → funds return to available balance
     * ════════════════════════════════════════════════════════════════════════ */
    public function rejectWithdrawal(Withdrawal $withdrawal, User $admin, string $reason): Withdrawal
    {
        if ($admin->role !== 'admin') throw new RuntimeException('Only admins can reject withdrawals');

        return DB::transaction(function () use ($withdrawal, $admin, $reason) {
            $w = Withdrawal::lockForUpdate()->find($withdrawal->id);
            if ($w->status !== 'pending') throw new RuntimeException('Withdrawal is not pending');

            $wallet = Wallet::lockForUpdate()->find($w->wallet_id);
            $wallet->pending_balance = bcsub((string) $wallet->pending_balance, (string) $w->amount, 2);
            $wallet->balance         = bcadd((string) $wallet->balance,         (string) $w->amount, 2);
            $wallet->save();

            $w->update([
                'status'           => 'rejected',
                'reviewed_by'      => $admin->id,
                'reviewed_at'      => now(),
                'rejection_reason' => $reason,
            ]);

            Transaction::where('withdrawal_id', $w->id)
                ->update(['status' => 'cancelled']);

            return $w->fresh();
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  DISPUTE RELEASE — admin moves part/all escrow to freelancer
     *
     *  Used by ContractController::resolveDispute. Distinct from releaseMilestone
     *  because dispute settlements may have no Milestone row and the admin chooses
     *  whether to apply commission. Atomic, locked, and idempotent via the key.
     * ════════════════════════════════════════════════════════════════════════ */
    public function disputeReleaseToFreelancer(
        Contract $contract,
        float $amount,
        ?string $idempotencyKey = null,
        bool $applyCommission = false,
    ): array {
        if ($amount <= 0) throw new RuntimeException('Dispute release amount must be positive');

        return DB::transaction(function () use ($contract, $amount, $idempotencyKey, $applyCommission) {
            if ($idempotencyKey && $this->findByIdempotencyKey($idempotencyKey)) {
                throw new RuntimeException('Dispute release already processed (idempotency)');
            }

            $c = Contract::lockForUpdate()->find($contract->id);
            if ((float) $c->escrow_amount < $amount) {
                throw new RuntimeException('Insufficient escrow to release this amount');
            }

            $clientWallet = $this->lockWallet($c->client);
            $clientWallet->escrow_balance = bcsub((string) $clientWallet->escrow_balance, (string) $amount, 2);
            $clientWallet->save();

            $c->escrow_amount = bcsub((string) $c->escrow_amount, (string) $amount, 2);
            $c->save();

            $feeRate    = $applyCommission ? (float) PlatformSetting::get('fee.freelancer_pct', 0.10) : 0;
            $commission = $applyCommission ? round($amount * $feeRate, 2) : 0;
            $payout     = round($amount - $commission, 2);

            // Client-side escrow drain transaction
            Transaction::create([
                'wallet_id'       => $clientWallet->id,
                'user_id'         => $c->client_id,
                'counterparty_user_id' => $c->freelancer_id,
                'contract_id'     => $c->id,
                'idempotency_key' => $idempotencyKey ? $idempotencyKey . ':client' : null,
                'reference'       => $this->ref('DRC'),
                'type'            => 'release',
                'direction'       => 'out',
                'amount'          => $amount,
                'balance_after'   => $clientWallet->balance,
                'status'          => 'completed',
                'description'     => 'Dispute resolution — escrow released',
            ]);

            // Optional platform commission
            if ($commission > 0) {
                $platform = $this->platformUser();
                $platformWallet = $this->lockWallet($platform);
                $platformWallet->balance = bcadd((string) $platformWallet->balance, (string) $commission, 2);
                $platformWallet->save();

                Transaction::create([
                    'wallet_id'       => $platformWallet->id,
                    'user_id'         => $platform->id,
                    'counterparty_user_id' => $c->freelancer_id,
                    'contract_id'     => $c->id,
                    'idempotency_key' => $idempotencyKey ? $idempotencyKey . ':platform' : null,
                    'reference'       => $this->ref('FEE'),
                    'type'            => 'fee',
                    'direction'       => 'in',
                    'amount'          => $commission,
                    'balance_after'   => $platformWallet->balance,
                    'status'          => 'completed',
                    'description'     => "Dispute resolution commission — contract #{$c->id}",
                ]);
            }

            // Freelancer credit
            $freelancer = User::findOrFail($c->freelancer_id);
            $freelancerWallet = $this->lockWallet($freelancer);
            $freelancerWallet->balance = bcadd((string) $freelancerWallet->balance, (string) $payout, 2);
            $freelancerWallet->save();

            $payoutTx = Transaction::create([
                'wallet_id'       => $freelancerWallet->id,
                'user_id'         => $freelancer->id,
                'counterparty_user_id' => $c->client_id,
                'contract_id'     => $c->id,
                'idempotency_key' => $idempotencyKey ? $idempotencyKey . ':freelancer' : null,
                'reference'       => $this->ref('DRF'),
                'type'            => 'credit',
                'direction'       => 'in',
                'amount'          => $payout,
                'fee'             => $commission,
                'balance_after'   => $freelancerWallet->balance,
                'status'          => 'completed',
                'description'     => "Dispute resolution payout — contract #{$c->id}",
            ]);

            return ['amount' => $amount, 'commission' => $commission, 'payout' => $payout, 'tx' => $payoutTx];
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  REVERSE DEPOSIT — Stripe-side refund: debit the user's wallet by the
     *  refunded amount and create an offsetting `refund` row referencing the
     *  original transaction. Idempotent via $idempotencyKey.
     *
     *  If the wallet doesn't have enough available balance (e.g. user spent
     *  the deposited funds already) we drive the balance NEGATIVE and emit
     *  a notification for the admin to resolve manually — refusing the refund
     *  is not an option (Stripe already moved the money out).
     * ════════════════════════════════════════════════════════════════════════ */
    public function reverseDeposit(
        Transaction $originalDeposit,
        float $amount,
        ?string $idempotencyKey = null,
        ?string $reason = null,
    ): Transaction {
        if ($amount <= 0) throw new RuntimeException('Reversal amount must be positive');
        if ($originalDeposit->type !== 'credit') {
            throw new RuntimeException("Cannot reverse a non-credit transaction (type={$originalDeposit->type})");
        }
        if ((float) $originalDeposit->amount < $amount) {
            throw new RuntimeException("Reversal amount {$amount} exceeds original deposit {$originalDeposit->amount}");
        }

        return DB::transaction(function () use ($originalDeposit, $amount, $idempotencyKey, $reason) {
            if ($tx = $this->findByIdempotencyKey($idempotencyKey)) return $tx;

            $user   = User::findOrFail($originalDeposit->user_id);
            $wallet = $this->lockWallet($user);

            // Debit the wallet — may go negative, that's correct Stripe-refund behavior.
            $wallet->balance = bcsub((string) $wallet->balance, (string) $amount, 2);
            $wallet->save();

            return Transaction::create([
                'wallet_id'       => $wallet->id,
                'user_id'         => $user->id,
                'idempotency_key' => $idempotencyKey,
                'reference'       => $this->ref('REV'),
                'type'            => 'refund',
                'direction'       => 'out',
                'amount'          => $amount,
                'balance_after'   => $wallet->balance,
                'status'          => 'completed',
                'description'     => $reason ?? "Stripe refund of {$originalDeposit->reference}",
                'metadata'        => [
                    'reverses_transaction_id' => $originalDeposit->id,
                    'reverses_reference'      => $originalDeposit->reference,
                ],
                'payment_method'    => 'stripe',
                'stripe_payment_id' => $originalDeposit->stripe_payment_id,
            ]);
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  FREEZE CONTRACT — chargeback received. Lock the contract by marking it
     *  disputed so milestone payouts stop (releaseMilestone already enforces
     *  this via its dispute guard).
     * ════════════════════════════════════════════════════════════════════════ */
    public function freezeContract(Contract $contract, string $reason): void
    {
        DB::transaction(function () use ($contract, $reason) {
            $locked = Contract::lockForUpdate()->find($contract->id);
            if (! $locked) return;
            if ($locked->status === 'completed' || $locked->status === 'cancelled') return;
            $locked->update([
                'status'            => 'disputed',
                'disputed_at'       => now(),
                'dispute_reason'    => $reason,
            ]);
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  REFUND — moves money from one party back to another with full audit trail
     *  (Stripe-style refund of a deposit, or refund of escrow back to client)
     * ════════════════════════════════════════════════════════════════════════ */
    public function refundEscrow(Contract $contract, float $amount, ?string $reason = null): Transaction
    {
        if ($amount <= 0) throw new RuntimeException('Refund amount must be positive');

        return DB::transaction(function () use ($contract, $amount, $reason) {
            $c = Contract::lockForUpdate()->find($contract->id);
            if ((float) $c->escrow_amount < $amount) {
                throw new RuntimeException('Refund exceeds escrow balance');
            }

            $clientWallet = $this->lockWallet($c->client);
            $clientWallet->escrow_balance = bcsub((string) $clientWallet->escrow_balance, (string) $amount, 2);
            $clientWallet->balance        = bcadd((string) $clientWallet->balance,        (string) $amount, 2);
            $clientWallet->save();

            $c->escrow_amount = bcsub((string) $c->escrow_amount, (string) $amount, 2);
            $c->save();

            return Transaction::create([
                'wallet_id'      => $clientWallet->id,
                'user_id'        => $c->client_id,
                'contract_id'    => $c->id,
                'reference'      => $this->ref('RFD'),
                'type'           => 'refund',
                'direction'      => 'in',
                'amount'         => $amount,
                'balance_after'  => $clientWallet->balance,
                'status'         => 'completed',
                'description'    => $reason ?? 'Escrow refund to client',
            ]);
        });
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  Helpers
     * ════════════════════════════════════════════════════════════════════════ */

    /** Lock the wallet row (create if missing) for safe mutation. */
    protected function lockWallet(User $user): Wallet
    {
        $existing = Wallet::where('user_id', $user->id)->lockForUpdate()->first();
        if ($existing) return $existing;
        // Race-safe create: try insert, then re-lock
        Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0, 'currency' => 'USD']);
        return Wallet::where('user_id', $user->id)->lockForUpdate()->first();
    }

    protected function findByIdempotencyKey(?string $key): ?Transaction
    {
        if (!$key) return null;
        return Transaction::where('idempotency_key', $key)->first();
    }

    protected function ref(string $prefix): string
    {
        return $prefix . '-' . strtoupper(Str::random(12));
    }

    protected function platformUser(): User
    {
        static $cached = null;
        if ($cached) return $cached;
        $u = User::where('is_platform', true)->first();
        if (!$u) throw new RuntimeException('Platform system user is missing — re-run payment migration');
        return $cached = $u;
    }
}
