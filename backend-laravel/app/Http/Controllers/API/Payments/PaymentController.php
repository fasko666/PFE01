<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Milestone;
use App\Models\PlatformSetting;
use App\Models\Transaction;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\LedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Thin controller — all money movement delegated to LedgerService.
 * Each endpoint:
 *   - validates input
 *   - validates ownership / authorization
 *   - asks the service to perform the operation atomically
 *   - returns the resulting state
 */
class PaymentController extends Controller
{
    public function __construct(private LedgerService $ledger) {}

    /* ──────────────────────────────────────────────────────────────────────
     *  GET /payments/wallet — current user's wallet + recent transactions
     * ────────────────────────────────────────────────────────────────────── */
    public function wallet(Request $request): JsonResponse
    {
        $user   = $request->user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        $transactions = Transaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => array_merge($wallet->toArray(), [
                'transactions' => $transactions,
            ]),
        ]);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  POST /payments/deposit — top up wallet
     *    body: { amount, idempotency_key?, payment_method?, stripe_payment_id? }
     * ────────────────────────────────────────────────────────────────────── */
    public function deposit(Request $request): JsonResponse
    {
        $request->validate([
            'amount'            => 'required|numeric|min:1|max:100000',
            'idempotency_key'   => 'nullable|string|max:100',
            'payment_method'    => 'nullable|string|max:50',
            'stripe_payment_id' => 'nullable|string|max:100',
        ]);

        try {
            $tx = $this->ledger->deposit(
                $request->user(),
                (float) $request->amount,
                $request->input('idempotency_key'),
                array_filter([
                    'description'       => 'Wallet deposit',
                    'payment_method'    => $request->input('payment_method'),
                    'stripe_payment_id' => $request->input('stripe_payment_id'),
                ]),
            );
            return response()->json(['data' => ['transaction' => $tx]], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  POST /payments/contracts/{contract}/fund-escrow
     *    body: { amount, idempotency_key? }
     * ────────────────────────────────────────────────────────────────────── */
    public function fundEscrow(Request $request, Contract $contract): JsonResponse
    {
        $request->validate([
            'amount'          => 'required|numeric|min:1',
            'idempotency_key' => 'nullable|string|max:100',
        ]);

        try {
            $tx = $this->ledger->fundEscrow(
                $request->user(),
                $contract,
                (float) $request->amount,
                $request->input('idempotency_key'),
            );
            return response()->json([
                'data' => [
                    'message'        => 'Escrow funded successfully',
                    'transaction'    => $tx,
                    'escrow_balance' => $contract->fresh()->escrow_amount,
                ],
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  POST /payments/milestones/{milestone}/release
     *    body: { idempotency_key? }
     * ────────────────────────────────────────────────────────────────────── */
    public function releaseMilestone(Request $request, Milestone $milestone): JsonResponse
    {
        $request->validate([
            'idempotency_key' => 'nullable|string|max:100',
        ]);

        try {
            $result = $this->ledger->releaseMilestone(
                $request->user(),
                $milestone,
                $request->input('idempotency_key'),
            );
            return response()->json([
                'data' => [
                    'message'    => 'Payment released to freelancer',
                    'amount'     => $result['amount'],
                    'commission' => $result['commission'],
                    'payout'     => $result['payout'],
                ],
            ]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  POST /payments/withdrawals — freelancer requests payout
     *    body: { amount, method, payout_details: {...} }
     * ────────────────────────────────────────────────────────────────────── */
    public function requestWithdrawal(Request $request): JsonResponse
    {
        $request->validate([
            'amount'             => 'required|numeric|min:1',
            'method'             => 'required|in:bank,paypal,wise,stripe,crypto',
            'payout_details'     => 'required|array',
        ]);

        try {
            $withdrawal = $this->ledger->requestWithdrawal(
                $request->user(),
                (float) $request->amount,
                $request->input('method'),
                (array) $request->input('payout_details'),
            );
            return response()->json(['data' => $withdrawal], 201);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  GET /payments/withdrawals — freelancer's own withdrawal history
     * ────────────────────────────────────────────────────────────────────── */
    public function myWithdrawals(Request $request): JsonResponse
    {
        $rows = Withdrawal::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        return response()->json(['data' => $rows]);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  GET /payments/overview — wallet summary
     * ────────────────────────────────────────────────────────────────────── */
    public function overview(Request $request): JsonResponse
    {
        $user   = $request->user();
        $wallet = Wallet::firstOrCreate(['user_id' => $user->id], ['balance' => 0]);

        $totalEarned = Transaction::where('user_id', $user->id)
            ->where('type', 'credit')
            ->where('status', 'completed')
            ->sum('amount');

        $totalSpent = Transaction::where('user_id', $user->id)
            ->whereIn('type', ['escrow', 'withdrawal'])
            ->where('status', 'completed')
            ->sum('amount');

        $pendingWithdrawals = Withdrawal::where('user_id', $user->id)
            ->where('status', 'pending')->sum('amount');

        return response()->json([
            'data' => [
                'available'           => (float) $wallet->balance,
                'pending'             => (float) $wallet->pending_balance,
                'in_escrow'           => (float) $wallet->escrow_balance,
                'total_earned'        => (float) $totalEarned,
                'total_spent'         => (float) $totalSpent,
                'pending_withdrawals' => (float) $pendingWithdrawals,
                'currency'            => $wallet->currency,
            ],
        ]);
    }
}
