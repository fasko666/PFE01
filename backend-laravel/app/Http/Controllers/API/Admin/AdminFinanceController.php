<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\PlatformSetting;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\LedgerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Admin-only finance + payment management.
 * All routes here are protected by the `admin` middleware (in routes/api.php).
 */
class AdminFinanceController extends Controller
{
    public function __construct(private LedgerService $ledger) {}

    /* ─── GET /admin/finance/dashboard ───────────────────────────────────── */
    public function dashboard(): JsonResponse
    {
        $platform = User::where('is_platform', true)->first();
        $platformWallet = $platform ? Wallet::where('user_id', $platform->id)->first() : null;

        $totalCommission = Transaction::where('user_id', $platform?->id)
            ->where('type', 'fee')
            ->where('status', 'completed')
            ->sum('amount');

        $totalEscrow = Wallet::sum('escrow_balance');

        $pendingWithdrawals = Withdrawal::where('status', 'pending')->count();
        $pendingWithdrawalsAmount = Withdrawal::where('status', 'pending')->sum('amount');

        $failedTx = Transaction::where('status', 'failed')->count();

        // Last 30 days revenue trend
        $revenueByDay = Transaction::selectRaw('DATE(created_at) as date, SUM(amount) as total')
            ->where('user_id', $platform?->id)
            ->where('type', 'fee')
            ->where('status', 'completed')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => [
                'platform_balance'     => (float) ($platformWallet?->balance ?? 0),
                'total_commission'     => (float) $totalCommission,
                'total_escrow'         => (float) $totalEscrow,
                'pending_withdrawals'  => $pendingWithdrawals,
                'pending_withdrawals_amount' => (float) $pendingWithdrawalsAmount,
                'failed_transactions'  => $failedTx,
                'revenue_30d'          => $revenueByDay,
            ],
        ]);
    }

    /* ─── GET /admin/finance/withdrawals — paginated, filterable ────────── */
    public function withdrawals(Request $request): JsonResponse
    {
        $q = Withdrawal::with('user:id,name,email,username');
        if ($request->status) $q->where('status', $request->status);
        $rows = $q->orderBy('created_at', 'desc')->paginate($request->per_page ?? 20);
        return response()->json(['data' => $rows]);
    }

    /* ─── POST /admin/finance/withdrawals/{withdrawal}/approve ─────────── */
    public function approveWithdrawal(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        $request->validate(['external_ref' => 'nullable|string|max:200']);

        try {
            $w = $this->ledger->approveWithdrawal(
                $withdrawal, $request->user(), $request->external_ref
            );
            return response()->json(['data' => $w]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /* ─── POST /admin/finance/withdrawals/{withdrawal}/reject ──────────── */
    public function rejectWithdrawal(Request $request, Withdrawal $withdrawal): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        try {
            $w = $this->ledger->rejectWithdrawal($withdrawal, $request->user(), $request->reason);
            return response()->json(['data' => $w]);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    /* ─── GET /admin/finance/settings ─────────────────────────────────── */
    public function settings(): JsonResponse
    {
        $rows = PlatformSetting::orderBy('group')->orderBy('key')->get();
        return response()->json(['data' => $rows]);
    }

    /* ─── PUT /admin/finance/settings ──────────────────────────────────
     *  body: { settings: { 'fee.freelancer_pct': '0.12', ... } }
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate(['settings' => 'required|array']);
        foreach ((array) $request->settings as $key => $value) {
            PlatformSetting::set($key, $value);
        }
        return response()->json(['data' => ['updated' => count((array) $request->settings)]]);
    }
}
