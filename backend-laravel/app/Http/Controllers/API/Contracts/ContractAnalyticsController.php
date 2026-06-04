<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Milestone;
use App\Models\TimeLog;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractAnalyticsController extends Controller
{
    public function analytics(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);

        $hoursSec = (int) TimeLog::where('contract_id', $contract->id)
            ->whereNotNull('ended_at')->sum('duration_seconds');

        $msStats = Milestone::where('contract_id', $contract->id)
            ->selectRaw('status, COUNT(*) as c, SUM(amount) as total')
            ->groupBy('status')->get()->keyBy('status');

        $paymentStats = Transaction::where('contract_id', $contract->id)
            ->selectRaw('type, direction, SUM(amount) as total, COUNT(*) as c')
            ->groupBy('type','direction')->get();

        $totalReleased = (float) Transaction::where('contract_id', $contract->id)
            ->where('user_id', $contract->freelancer_id)
            ->where('type', 'credit')->where('status', 'completed')->sum('amount');
        $totalCommission = (float) Transaction::where('contract_id', $contract->id)
            ->where('type', 'fee')->where('status', 'completed')->sum('amount');

        return response()->json(['data' => [
            'hours_worked'        => round($hoursSec / 3600, 2),
            'seconds_worked'      => $hoursSec,
            'milestones_total'    => $contract->milestones()->count(),
            'milestones_paid'     => (int) ($msStats['paid']->c        ?? 0),
            'milestones_pending'  => (int) ($msStats['pending']->c     ?? 0),
            'milestones_submitted'=> (int) ($msStats['submitted']->c   ?? 0),
            'total_released_to_freelancer' => $totalReleased,
            'total_platform_commission'    => $totalCommission,
            'escrow_amount'       => (float) $contract->escrow_amount,
            'contract_amount'     => (float) $contract->amount,
            'payment_breakdown'   => $paymentStats,
            'days_active'         => $contract->started_at
                ? (int) $contract->started_at->diffInDays(now())
                : 0,
        ]]);
    }

    public function activity(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);

        $rows = $contract->activities()
            ->with('actor:id,name,username,avatar')
            ->limit(200)
            ->get();

        return response()->json(['data' => $rows]);
    }

    private function guard(Request $request, Contract $contract): void
    {
        if (! $request->user()->can('view', $contract)) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }
    }
}
