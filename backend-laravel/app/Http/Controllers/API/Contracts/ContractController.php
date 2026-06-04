<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Transaction;
use App\Services\LedgerService;
use App\Services\NotificationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * ContractController — production contract lifecycle.
 *
 * Authorization is delegated to ContractPolicy. State-machine transitions are
 * validated via Contract::canTransitionTo() so 403 (auth) is distinguishable
 * from 422 (invalid state). Money movement always flows through LedgerService.
 */
class ContractController extends Controller
{
    public function __construct(
        private LedgerService       $ledger,
        private NotificationService $notifications,
    ) {}

    /* ════════════════════════════════════════════════════════════════════════
     *  GET /contracts — list contracts visible to the user
     * ════════════════════════════════════════════════════════════════════════ */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'status'   => 'nullable|in:pending,active,paused,completed,cancelled,disputed',
            'q'        => 'nullable|string|max:255',
            'role'     => 'nullable|in:client,freelancer',  // filter "as_client" / "as_freelancer"
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $q = Contract::query()
            ->with(['client:id,name,username,avatar,role', 'freelancer:id,name,username,avatar,role', 'job:id,title']);

        // Visibility: admins see everything; everyone else sees only their contracts.
        if ($user->role !== 'admin') {
            $q->where(function ($w) use ($user) {
                $w->where('client_id', $user->id)
                  ->orWhere('freelancer_id', $user->id);
            });
        }

        if ($request->filled('role') && $user->role !== 'admin') {
            $q->where($request->role === 'client' ? 'client_id' : 'freelancer_id', $user->id);
        }

        if ($request->filled('status')) {
            $q->where('status', $request->status);
        }

        // Archived filter: include=archived only, exclude (default) hides archived
        if ($request->boolean('archived')) {
            $q->whereNotNull('archived_at');
        } elseif (! $request->boolean('include_archived')) {
            $q->whereNull('archived_at');
        }

        if ($request->filled('q')) {
            $needle = '%'.str_replace(['%', '_'], ['\\%', '\\_'], (string) $request->q).'%';
            $q->where(function ($w) use ($needle) {
                $w->where('title', 'like', $needle)
                  ->orWhere('description', 'like', $needle);
            });
        }

        $rows = $q->orderByDesc('created_at')->paginate($request->integer('per_page', 15));

        return response()->json(['data' => $rows]);
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  GET /contracts/{contract} — full detail with milestones, payments, etc.
     * ════════════════════════════════════════════════════════════════════════ */
    public function show(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'view', $contract);

        $contract->load([
            'client:id,name,username,avatar,role,country',
            'freelancer:id,name,username,avatar,role,country',
            'job:id,title,category_id,type',
            'milestones',
            'reviews',
            'conversation:id,contract_id',
            'disputeOpener:id,name,username,role',
            'resolver:id,name,username,role',
        ]);

        $payments = Transaction::where('contract_id', $contract->id)
            ->orderByDesc('created_at')
            ->limit(100)
            ->get([
                'id', 'type', 'direction', 'amount', 'fee', 'balance_after',
                'status', 'description', 'reference', 'milestone_id', 'created_at',
            ]);

        return response()->json([
            'data' => array_merge($contract->toArray(), [
                'payments'        => $payments,
                'conversation_id' => $contract->conversation?->id,
                'allowed_actions' => $this->allowedActions($request->user(), $contract),
            ]),
        ]);
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  POST /contracts/{contract}/complete — client closes the contract
     *
     *  - Refunds any remaining escrow back to client (LedgerService::refundEscrow)
     *  - Marks the contract `completed` with completed_by + ended_at
     *  - Notifies the freelancer
     * ════════════════════════════════════════════════════════════════════════ */
    public function complete(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'complete', $contract);
        $this->assertTransition($contract, 'completed');

        $user = $request->user();

        DB::transaction(function () use ($contract, $user) {
            // Refund any leftover escrow to client (idempotent: only acts if > 0)
            $leftover = (float) $contract->escrow_amount;
            if ($leftover > 0) {
                $this->ledger->refundEscrow($contract, $leftover, 'Contract completed — returning unused escrow');
            }

            $contract->update([
                'status'       => 'completed',
                'ended_at'     => now(),
                'completed_by' => $user->id,
            ]);
        });

        // Notify the other party
        $other = $user->id === (int) $contract->client_id ? $contract->freelancer : $contract->client;
        if ($other) {
            $this->notifications->send($other, [
                'type'       => 'contract',
                'title'      => 'Contract completed',
                'body'       => "Contract \"{$contract->title}\" was marked completed.",
                'action_url' => "/contracts/{$contract->id}",
                'icon'       => 'check-circle',
            ]);
        }

        return response()->json([
            'data' => [
                'message'  => 'Contract completed.',
                'contract' => $contract->fresh(),
            ],
        ]);
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  POST /contracts/{contract}/cancel  body: { cancellation_reason }
     *
     *  - Either participant or an admin can cancel
     *  - Refuses if status is `disputed` (use resolve-dispute) or already terminal
     *  - Refunds any held escrow back to client
     * ════════════════════════════════════════════════════════════════════════ */
    public function cancel(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'cancel', $contract);

        if ($contract->status === 'disputed') {
            return response()->json([
                'message' => 'A disputed contract must be resolved by an admin, not cancelled directly.',
            ], 422);
        }

        $this->assertTransition($contract, 'cancelled');

        $request->validate([
            'cancellation_reason' => 'required|string|min:5|max:1000',
        ]);

        $user = $request->user();

        DB::transaction(function () use ($contract, $user, $request) {
            $leftover = (float) $contract->escrow_amount;
            if ($leftover > 0) {
                $this->ledger->refundEscrow($contract, $leftover, 'Contract cancelled — returning escrow to client');
            }

            $contract->update([
                'status'              => 'cancelled',
                'ended_at'            => now(),
                'cancelled_by'        => $user->id,
                'cancellation_reason' => $request->input('cancellation_reason'),
            ]);
        });

        // Notify everyone except the actor
        $others = collect([$contract->client, $contract->freelancer])
            ->filter(fn ($u) => $u && (int) $u->id !== (int) $user->id);

        foreach ($others as $u) {
            $this->notifications->send($u, [
                'type'       => 'contract',
                'title'      => 'Contract cancelled',
                'body'       => "Contract \"{$contract->title}\" was cancelled by {$user->name}.",
                'action_url' => "/contracts/{$contract->id}",
                'icon'       => 'x-circle',
            ]);
        }

        return response()->json([
            'data' => [
                'message'  => 'Contract cancelled.',
                'contract' => $contract->fresh(),
            ],
        ]);
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  POST /contracts/{contract}/dispute  body: { dispute_reason }
     *
     *  - Locks payments: LedgerService::releaseMilestone refuses on 'disputed'
     *  - Notifies the other party AND all admins
     * ════════════════════════════════════════════════════════════════════════ */
    public function dispute(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'dispute', $contract);
        $this->assertTransition($contract, 'disputed');

        $request->validate([
            'dispute_reason' => 'required|string|min:10|max:2000',
        ]);

        $user = $request->user();

        $contract->update([
            'status'            => 'disputed',
            'disputed_at'       => now(),
            'dispute_opened_by' => $user->id,
            'dispute_reason'    => $request->input('dispute_reason'),
        ]);

        // Notify the other participant
        $other = $user->id === (int) $contract->client_id ? $contract->freelancer : $contract->client;
        if ($other) {
            $this->notifications->send($other, [
                'type'       => 'dispute',
                'title'      => 'Dispute opened',
                'body'       => "A dispute was opened on contract \"{$contract->title}\".",
                'action_url' => "/contracts/{$contract->id}",
                'icon'       => 'alert-triangle',
            ]);
        }

        // Notify every admin so the moderation queue lights up
        \App\Models\User::query()
            ->where('role', 'admin')
            ->where('is_active', true)
            ->where('is_platform', false)
            ->get()
            ->each(function ($admin) use ($contract) {
                $this->notifications->send($admin, [
                    'type'       => 'dispute',
                    'title'      => 'New dispute requires review',
                    'body'       => "Contract \"{$contract->title}\" has a new dispute.",
                    'action_url' => "/contracts/{$contract->id}",
                    'icon'       => 'shield-alert',
                ]);
            });

        return response()->json([
            'data' => [
                'message'  => 'Dispute opened. An admin will review shortly.',
                'contract' => $contract->fresh(),
            ],
        ]);
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  POST /contracts/{contract}/resolve-dispute   (admin only)
     *      body: { outcome: 'release_to_freelancer'|'refund_to_client'|'split',
     *              split_freelancer_amount?: number, notes?: string }
     *
     *  Outcome semantics:
     *    release_to_freelancer → entire escrow released to freelancer (no commission applied
     *                            here — admin can manually trigger milestone release if
     *                            milestones exist; this path is for stuck/no-milestone cases)
     *    refund_to_client      → entire escrow returned to client
     *    split                 → split_freelancer_amount goes to freelancer wallet,
     *                            remainder refunded to client
     *
     *  After money moves, the contract transitions to:
     *    refund_to_client  → cancelled
     *    others            → active (parties can continue or follow up with complete)
     * ════════════════════════════════════════════════════════════════════════ */
    public function resolveDispute(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'resolveDispute', $contract);

        if ($contract->status !== 'disputed') {
            return response()->json(['message' => 'Contract is not under dispute.'], 422);
        }

        $request->validate([
            'outcome'                  => 'required|in:release_to_freelancer,refund_to_client,split',
            'split_freelancer_amount'  => 'nullable|numeric|min:0',
            'notes'                    => 'nullable|string|max:1000',
        ]);

        $outcome    = $request->input('outcome');
        $escrow     = (float) $contract->escrow_amount;
        $admin      = $request->user();

        if ($outcome === 'split') {
            $request->validate(['split_freelancer_amount' => 'required|numeric|min:0|max:'.$escrow]);
        }

        DB::transaction(function () use ($contract, $outcome, $escrow, $admin, $request) {
            if ($outcome === 'refund_to_client') {
                if ($escrow > 0) {
                    $this->ledger->refundEscrow($contract, $escrow, 'Dispute resolved — full refund to client');
                }
            } elseif ($outcome === 'release_to_freelancer') {
                if ($escrow > 0) {
                    $this->ledger->disputeReleaseToFreelancer(
                        $contract, $escrow, "dispute:{$contract->id}:full"
                    );
                }
            } elseif ($outcome === 'split') {
                $toFreelancer = (float) $request->input('split_freelancer_amount');
                $toClient     = round($escrow - $toFreelancer, 2);
                if ($toFreelancer > 0) {
                    $this->ledger->disputeReleaseToFreelancer(
                        $contract, $toFreelancer, "dispute:{$contract->id}:split"
                    );
                }
                if ($toClient > 0) {
                    $this->ledger->refundEscrow($contract, $toClient, 'Dispute resolved — partial refund to client');
                }
            }

            $newStatus = $outcome === 'refund_to_client' ? 'cancelled' : 'active';

            $contract->update([
                'status'             => $newStatus,
                'resolved_at'        => now(),
                'resolved_by'        => $admin->id,
                'resolution_outcome' => $outcome,
                'ended_at'           => $newStatus === 'cancelled' ? now() : null,
            ]);
        });

        // Notify both participants
        foreach (array_filter([$contract->client, $contract->freelancer]) as $u) {
            $this->notifications->send($u, [
                'type'       => 'dispute',
                'title'      => 'Dispute resolved',
                'body'       => "The dispute on \"{$contract->title}\" has been resolved by an admin.",
                'action_url' => "/contracts/{$contract->id}",
                'icon'       => 'check-shield',
            ]);
        }

        return response()->json([
            'data' => [
                'message'  => 'Dispute resolved.',
                'contract' => $contract->fresh(),
            ],
        ]);
    }

    /* ════════════════════════════════════════════════════════════════════════
     *  GET /contracts/my/{tab}  where tab ∈ active|completed|disputed
     * ════════════════════════════════════════════════════════════════════════ */
    public function myActive(Request $request): JsonResponse    { return $this->myTab($request, ['active', 'paused', 'pending']); }
    public function myCompleted(Request $request): JsonResponse { return $this->myTab($request, ['completed']); }
    public function myDisputed(Request $request): JsonResponse  { return $this->myTab($request, ['disputed']); }

    /* Archive / unarchive (terminal contracts only) */
    public function archive(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'view', $contract);
        if (! $contract->isTerminal()) {
            return response()->json(['message' => 'Only completed or cancelled contracts can be archived'], 422);
        }
        $contract->update(['archived_at' => now()]);
        return response()->json(['data' => $contract->fresh()]);
    }

    public function unarchive(Request $request, Contract $contract): JsonResponse
    {
        $this->authorizeOrFail($request, 'view', $contract);
        $contract->update(['archived_at' => null]);
        return response()->json(['data' => $contract->fresh()]);
    }

    private function myTab(Request $request, array $statuses): JsonResponse
    {
        $user = $request->user();

        $rows = Contract::query()
            ->with(['client:id,name,username,avatar', 'freelancer:id,name,username,avatar', 'job:id,title'])
            ->where(function ($w) use ($user) {
                $w->where('client_id', $user->id)->orWhere('freelancer_id', $user->id);
            })
            ->whereIn('status', $statuses)
            ->orderByDesc('updated_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => $rows]);
    }

    /* ── helpers ─────────────────────────────────────────────────────────── */

    /** Throw a clean 403 JsonResponse if the policy denies the ability. */
    private function authorizeOrFail(Request $request, string $ability, Contract $contract): void
    {
        if (! $request->user()->can($ability, $contract)) {
            throw new AuthorizationException("You are not authorized to {$ability} this contract.");
        }
    }

    /** Returns 422 if the state machine forbids the target transition. */
    private function assertTransition(Contract $contract, string $target): void
    {
        if ($contract->isTerminal()) {
            abort(response()->json([
                'message' => "Contract is {$contract->status} and cannot be modified.",
            ], 422));
        }
        if (! $contract->canTransitionTo($target)) {
            abort(response()->json([
                'message' => "Cannot transition from {$contract->status} to {$target}.",
            ], 422));
        }
    }

    /** Map of action → allowed (for the frontend to drive ContractActions buttons). */
    private function allowedActions(\App\Models\User $user, Contract $contract): array
    {
        return [
            'view'            => $user->can('view',           $contract),
            'complete'        => $user->can('complete',       $contract) && $contract->canTransitionTo('completed'),
            'cancel'          => $user->can('cancel',         $contract) && $contract->canTransitionTo('cancelled') && $contract->status !== 'disputed',
            'dispute'         => $user->can('dispute',        $contract) && $contract->canTransitionTo('disputed'),
            'resolve_dispute' => $user->can('resolveDispute', $contract) && $contract->status === 'disputed',
        ];
    }
}
