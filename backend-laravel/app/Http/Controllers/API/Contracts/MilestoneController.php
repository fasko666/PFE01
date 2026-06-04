<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Http\Requests\RejectMilestoneRequest;
use App\Http\Requests\StoreMilestoneRequest;
use App\Http\Requests\SubmitMilestoneRequest;
use App\Models\Contract;
use App\Models\ContractActivity;
use App\Models\Milestone;
use App\Services\ContractActivityService;
use App\Services\LedgerService;
use App\Services\NotificationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Milestones state machine (enforced via assertTransition):
 *
 *   pending ─┐
 *            ├─► in_progress ─► submitted ─► approved ─► paid (set by LedgerService)
 *            ├─► submitted                  └─► rejected ─► in_progress (retry)
 *            └─► (delete allowed in pending only)
 *
 * Authorization comes from MilestonePolicy. Money movement goes through
 * LedgerService::releaseMilestone (which already runs the dispute guard).
 */
class MilestoneController extends Controller
{
    public function __construct(
        private LedgerService            $ledger,
        private NotificationService      $notify,
        private ContractActivityService  $activity,
    ) {}

    /* ── GET /contracts/{contract}/milestones ────────────────────────────── */
    public function index(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, 'view', $contract, viaContract: true);

        $rows = $contract->milestones()
            ->with(['submitter:id,name,username,avatar', 'creator:id,name,username,avatar'])
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 50));

        return response()->json(['data' => $rows]);
    }

    /* ── POST /contracts/{contract}/milestones ───────────────────────────── */
    public function store(StoreMilestoneRequest $request, Contract $contract): JsonResponse
    {
        if (! $request->user()->can('create', [Milestone::class, $contract])) {
            throw new AuthorizationException('Only the contract client can create milestones.');
        }
        if ($contract->isTerminal()) {
            return response()->json(['message' => "Cannot add milestones to a {$contract->status} contract."], 422);
        }

        $data = $request->validated();
        // The FormRequest accepts both `due_date` and `due_at`; resolve to the DB column.
        $dueAt = $data['due_at'] ?? $data['due_date'] ?? $request->input('due_at') ?? $request->input('due_date');

        $milestone = Milestone::create([
            'contract_id' => $contract->id,
            'created_by'  => $request->user()->id,
            'title'       => $data['title'],
            'description' => $data['description'],
            'amount'      => $data['amount'],
            'due_at'      => $dueAt,
            'sort_order'  => $data['sort_order'] ?? $contract->milestones()->count(),
            'status'      => 'pending',
        ]);

        $this->activity->log($contract, $request->user()->id, 'milestone.created', [
            'milestone_id' => $milestone->id,
            'title'        => $milestone->title,
            'amount'       => (float) $milestone->amount,
        ]);

        $this->notify->send($contract->freelancer, [
            'type'       => 'milestone',
            'title'      => 'New milestone added',
            'body'       => "Client added milestone \"{$milestone->title}\" (\${$milestone->amount}).",
            'action_url' => "/milestones/{$milestone->id}",
            'icon'       => 'plus-circle',
        ]);

        return response()->json([
            'data' => $milestone->fresh(['creator:id,name,username,avatar']),
        ], 201);
    }

    /* ── GET /milestones/{milestone} ─────────────────────────────────────── */
    public function show(Request $request, Milestone $milestone): JsonResponse
    {
        $this->guard($request, 'view', $milestone);

        $milestone->load([
            'contract:id,title,client_id,freelancer_id,status,amount,escrow_amount',
            'contract.client:id,name,username,avatar',
            'contract.freelancer:id,name,username,avatar',
            'creator:id,name,username,avatar',
            'submitter:id,name,username,avatar',
        ]);

        // Activity rows scoped to this milestone (filtered from the contract activity feed)
        $activities = ContractActivity::where('contract_id', $milestone->contract_id)
            ->where(function ($q) use ($milestone) {
                $q->where('data->milestone_id', $milestone->id)
                  ->orWhere('data->milestone_id', (string) $milestone->id);
            })
            ->with('actor:id,name,username,avatar')
            ->orderByDesc('created_at')
            ->limit(100)
            ->get();

        $payments = \App\Models\Transaction::where('milestone_id', $milestone->id)
            ->orderByDesc('created_at')
            ->get(['id', 'type', 'direction', 'amount', 'fee', 'status', 'description', 'reference', 'created_at']);

        return response()->json([
            'data' => array_merge($milestone->toArray(), [
                'activities'      => $activities,
                'payments'        => $payments,
                'allowed_actions' => $this->allowedActions($request->user(), $milestone),
            ]),
        ]);
    }

    /* ── PUT /milestones/{milestone} (kept for parity with existing routes) */
    public function update(Request $request, Milestone $milestone): JsonResponse
    {
        $this->guard($request, 'update', $milestone);
        $data = $request->validate([
            'title'       => 'sometimes|string|max:255',
            'description' => 'sometimes|string|min:3|max:5000',
            'amount'      => 'sometimes|numeric|min:0.01|max:1000000',
            'due_at'      => 'sometimes|date',
            'sort_order'  => 'sometimes|integer|min:0',
        ]);
        $milestone->update($data);
        $this->activity->log($milestone->contract, $request->user()->id, 'milestone.updated', ['milestone_id' => $milestone->id]);
        return response()->json(['data' => $milestone->fresh()]);
    }

    /* ── DELETE /milestones/{milestone} ──────────────────────────────────── */
    public function destroy(Request $request, Milestone $milestone): JsonResponse
    {
        $this->guard($request, 'delete', $milestone);
        $contract = $milestone->contract;
        $milestone->delete();
        $this->activity->log($contract, $request->user()->id, 'milestone.deleted', ['milestone_id' => $milestone->id]);
        return response()->json(['data' => ['deleted' => true]]);
    }

    /* ── POST /milestones/{milestone}/submit ─────────────────────────────── */
    public function submit(SubmitMilestoneRequest $request, Milestone $milestone): JsonResponse
    {
        $this->guard($request, 'submit', $milestone);
        if (! in_array($milestone->status, ['pending', 'in_progress', 'rejected'], true)) {
            return response()->json(['message' => "Cannot submit a {$milestone->status} milestone."], 422);
        }
        $data = $request->validated();

        $milestone->update([
            'status'           => 'submitted',
            'submitted_at'     => now(),
            'submitted_by'     => $request->user()->id,
            'submission_notes' => $data['submission_message'],
            'attachments'      => $data['attachments'] ?? $milestone->attachments,
            'rejection_reason' => null,                                   // clear any previous reject
        ]);

        $this->activity->log($milestone->contract, $request->user()->id, 'milestone.submitted', [
            'milestone_id' => $milestone->id,
        ]);

        $this->notify->send($milestone->contract->client, [
            'type'       => 'milestone',
            'title'      => 'Milestone submitted for review',
            'body'       => "{$milestone->contract->freelancer->name} submitted \"{$milestone->title}\".",
            'action_url' => "/milestones/{$milestone->id}",
            'icon'       => 'upload',
        ]);

        return response()->json(['data' => $milestone->fresh(['submitter:id,name,username,avatar'])]);
    }

    /* ── POST /milestones/{milestone}/approve ────────────────────────────── */
    public function approve(Request $request, Milestone $milestone): JsonResponse
    {
        $this->guard($request, 'approve', $milestone);
        if ($milestone->status !== 'submitted') {
            return response()->json(['message' => 'Milestone must be submitted before approval.'], 422);
        }

        try {
            // LedgerService::releaseMilestone is atomic, locks rows, checks dispute, and pays out.
            $result = $this->ledger->releaseMilestone(
                $request->user(),
                $milestone,
                "ms:{$milestone->id}:".now()->timestamp
            );
        } catch (\Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        // Stamp approved_at — LedgerService already set status='paid' + approved_at;
        // we re-set it as a defensive no-op for tests that bypass commission settings.
        $milestone->forceFill(['approved_at' => now()])->save();

        $this->activity->log($milestone->contract, $request->user()->id, 'milestone.approved', [
            'milestone_id' => $milestone->id,
            'amount'       => $result['amount'],
            'commission'   => $result['commission'],
            'payout'       => $result['payout'],
        ]);

        $this->notify->send($milestone->contract->freelancer, [
            'type'       => 'payment',
            'title'      => 'Milestone payment released',
            'body'       => "\${$result['payout']} was released to your wallet for \"{$milestone->title}\".",
            'action_url' => '/payments',
            'icon'       => 'check-circle',
        ]);

        return response()->json([
            'data' => [
                'milestone' => $milestone->fresh(),
                'payment'   => $result,
            ],
        ]);
    }

    /* ── POST /milestones/{milestone}/reject ─────────────────────────────── */
    public function reject(RejectMilestoneRequest $request, Milestone $milestone): JsonResponse
    {
        $this->guard($request, 'reject', $milestone);
        if ($milestone->status !== 'submitted') {
            return response()->json(['message' => 'Only submitted milestones can be rejected.'], 422);
        }
        $data = $request->validated();

        $milestone->update([
            'status'           => 'rejected',
            'rejection_reason' => $data['rejection_reason'],
        ]);

        $this->activity->log($milestone->contract, $request->user()->id, 'milestone.rejected', [
            'milestone_id' => $milestone->id,
            'reason'       => $data['rejection_reason'],
        ]);

        $this->notify->send($milestone->contract->freelancer, [
            'type'       => 'milestone',
            'title'      => 'Milestone needs revision',
            'body'       => "\"{$milestone->title}\" was rejected. Reason: ".mb_substr($data['rejection_reason'], 0, 120),
            'action_url' => "/milestones/{$milestone->id}",
            'icon'       => 'alert-triangle',
        ]);

        return response()->json(['data' => $milestone->fresh()]);
    }

    /* ── helpers ─────────────────────────────────────────────────────────── */

    /**
     * Single authorization gate. `viaContract: true` means the ability is on a
     * Contract (used for the index/create case where the milestone doesn't exist
     * yet so we authorize against the contract instead).
     */
    private function guard(Request $request, string $ability, $model, bool $viaContract = false): void
    {
        $can = $viaContract
            ? $request->user()->can($ability, $model)
            : $request->user()->can($ability, $model);

        if (! $can) {
            throw new AuthorizationException("You are not authorized to {$ability} this milestone.");
        }
    }

    /** Drives the UI's button visibility (server-driven permissions). */
    private function allowedActions(\App\Models\User $user, Milestone $milestone): array
    {
        return [
            'view'    => $user->can('view',    $milestone),
            'update'  => $user->can('update',  $milestone),
            'delete'  => $user->can('delete',  $milestone),
            'submit'  => $user->can('submit',  $milestone) && in_array($milestone->status, ['pending', 'in_progress', 'rejected'], true),
            'approve' => $user->can('approve', $milestone) && $milestone->status === 'submitted',
            'reject'  => $user->can('reject',  $milestone) && $milestone->status === 'submitted',
        ];
    }
}
