<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\TimeLog;
use App\Services\ContractActivityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TimeTrackingController extends Controller
{
    public function __construct(private ContractActivityService $activity) {}

    /** Start a timer. Refuses if one is already running. */
    public function start(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        if ((int) $contract->freelancer_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Only the freelancer can track time on this contract'], 403);
        }

        $running = TimeLog::running()->where('user_id', $request->user()->id)->first();
        if ($running) {
            return response()->json(['message' => 'A timer is already running', 'data' => $running], 409);
        }

        $log = TimeLog::create([
            'contract_id' => $contract->id,
            'user_id'     => $request->user()->id,
            'started_at'  => now(),
            'description' => $request->input('description'),
        ]);
        $this->activity->log($contract, $request->user()->id, 'time.started', ['log_id' => $log->id]);
        return response()->json(['data' => $log], 201);
    }

    public function stop(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        $log = TimeLog::running()->where('contract_id', $contract->id)->where('user_id', $request->user()->id)->first();
        if (! $log) {
            return response()->json(['message' => 'No running timer found'], 404);
        }
        $data = $request->validate([
            'description'    => 'nullable|string|max:500',
            'screenshot_url' => 'nullable|url|max:500',
        ]);

        $endedAt = now();
        $log->update([
            'ended_at'         => $endedAt,
            'duration_seconds' => $endedAt->diffInSeconds($log->started_at),
            'description'      => $data['description'] ?? $log->description,
            'screenshot_url'   => $data['screenshot_url'] ?? $log->screenshot_url,
        ]);
        $this->activity->log($contract, $request->user()->id, 'time.stopped',
            ['log_id' => $log->id, 'duration' => $log->duration_seconds]);
        return response()->json(['data' => $log->fresh()]);
    }

    public function index(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        $logs = $contract->timeLogs()->with('user:id,name,avatar')->orderByDesc('started_at')->paginate(50);
        return response()->json(['data' => $logs]);
    }

    /** Weekly aggregation. */
    public function weekly(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        $weeks = TimeLog::query()
            ->where('contract_id', $contract->id)
            ->whereNotNull('ended_at')
            ->selectRaw("DATE_FORMAT(started_at, '%Y-%u') as iso_week, SUM(duration_seconds) as total_seconds, COUNT(*) as logs")
            ->groupBy('iso_week')
            ->orderByDesc('iso_week')
            ->limit(20)
            ->get();
        return response()->json(['data' => $weeks]);
    }

    private function guard(Request $request, Contract $contract): void
    {
        if (! $request->user()->can('view', $contract)) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }
    }
}
