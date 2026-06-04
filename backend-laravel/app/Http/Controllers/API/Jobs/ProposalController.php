<?php

namespace App\Http\Controllers\API\Jobs;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProposalRequest;
use App\Models\Contract;
use App\Models\Conversation;
use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\User;
use App\Services\AuditLogService;
use App\Services\NotificationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Proposal lifecycle:
 *   - store    → freelancer submits + connects deducted atomically
 *   - withdraw → freelancer cancels their pending proposal + connects refunded
 *   - accept   → client accepts → Contract + Conversation created
 *   - reject   → client rejects → status changes
 *
 * Authorization: ProposalPolicy / JobPolicy. Money/connects move atomically
 * inside DB::transaction + lockForUpdate().
 */
class ProposalController extends Controller
{
    /** Standard cost per proposal — kept here so it's easy to change later. */
    public const CONNECTS_PER_PROPOSAL = 2;

    public function __construct(
        private NotificationService $notifications,
        private AuditLogService     $audit,
    ) {}

    public function index(Request $request, JobPosting $job): JsonResponse
    {
        if (! $request->user()->can('update', $job)) {
            throw new AuthorizationException();
        }
        $proposals = Proposal::with(['freelancer.freelancerProfile', 'freelancer.skills'])
            ->where('job_id', $job->id)
            ->orderByDesc('created_at')
            ->paginate(10);
        return response()->json(['data' => $proposals]);
    }

    public function store(StoreProposalRequest $request, JobPosting $job): JsonResponse
    {
        if (! $request->user()->can('create', [Proposal::class, $job])) {
            throw new AuthorizationException();
        }
        if (Proposal::where('job_id', $job->id)->where('freelancer_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You already submitted a proposal for this job'], 409);
        }

        $data = $request->validated();

        $proposal = DB::transaction(function () use ($request, $job, $data) {
            // Lock the user row before reading + decrementing connects_balance.
            $user = User::where('id', $request->user()->id)->lockForUpdate()->first();

            $cost = self::CONNECTS_PER_PROPOSAL;
            if ((int) $user->connects_balance < $cost) {
                abort(response()->json([
                    'message' => "Insufficient connects. You need {$cost}, you have {$user->connects_balance}.",
                    'code'    => 'INSUFFICIENT_CONNECTS',
                ], 422));
            }
            $user->decrement('connects_balance', $cost);

            $p = Proposal::create([
                'job_id'             => $job->id,
                'freelancer_id'      => $request->user()->id,
                'cover_letter'       => $data['cover_letter'],
                'bid_amount'         => $data['bid_amount'],
                'estimated_duration' => $data['estimated_days'] ?? $data['estimated_duration'] ?? null,
                'status'             => 'pending',
                'connects_used'      => $cost,
                'is_ai_generated'    => (bool) ($data['is_ai_generated'] ?? false),
            ]);

            $job->increment('proposals_count');
            return $p;
        });

        $this->audit->log('proposal.created', $request->user()->id, $proposal, [
            'job_id'        => $job->id,
            'connects_used' => self::CONNECTS_PER_PROPOSAL,
        ]);

        $this->notifications->send($job->client, [
            'type'       => 'proposal',
            'title'      => 'New proposal received',
            'body'       => "A freelancer submitted a proposal for \"{$job->title}\".",
            'action_url' => "/jobs/{$job->id}/proposals",
            'icon'       => 'file',
        ]);

        if ($job->client && class_exists(\App\Notifications\ProposalReceivedNotification::class)) {
            try { $job->client->notify(new \App\Notifications\ProposalReceivedNotification($proposal)); }
            catch (\Throwable $e) { \Log::warning('ProposalReceived notify failed', ['err' => $e->getMessage()]); }
        }

        return response()->json(['data' => $proposal->load('freelancer')], 201);
    }

    /** POST /proposals/{proposal}/withdraw — refunds connects */
    public function withdraw(Request $request, Proposal $proposal): JsonResponse
    {
        if (! $request->user()->can('withdraw', $proposal)) {
            throw new AuthorizationException('You can only withdraw your own pending proposal.');
        }

        $refunded = 0;
        DB::transaction(function () use ($proposal, &$refunded) {
            $user = User::where('id', $proposal->freelancer_id)->lockForUpdate()->first();
            if ($user && (int) $proposal->connects_used > 0) {
                $user->increment('connects_balance', (int) $proposal->connects_used);
                $refunded = (int) $proposal->connects_used;
            }
            $proposal->update(['status' => 'withdrawn']);
            $proposal->job?->decrement('proposals_count');
        });

        $this->audit->log('proposal.withdrawn', $request->user()->id, $proposal, ['connects_refunded' => $refunded]);

        return response()->json(['data' => ['message' => 'Proposal withdrawn.', 'connects_refunded' => $refunded]]);
    }

    public function accept(Request $request, Proposal $proposal): JsonResponse
    {
        if (! $request->user()->can('decide', $proposal)) {
            throw new AuthorizationException();
        }
        if (! in_array($proposal->status, ['pending', 'shortlisted'], true)) {
            return response()->json(['message' => 'Only pending proposals can be accepted'], 422);
        }
        $job = $proposal->job;

        $contract = DB::transaction(function () use ($proposal, $job) {
            $proposal->update(['status' => 'accepted']);
            $job->update(['status' => 'in_progress']);

            $c = Contract::create([
                'job_id'        => $job->id,
                'proposal_id'   => $proposal->id,
                'client_id'     => $job->client_id,
                'freelancer_id' => $proposal->freelancer_id,
                'title'         => $job->title,
                'description'   => $job->description,
                'type'          => $job->type,
                'amount'        => $proposal->bid_amount,
                'status'        => 'active',
                'started_at'    => now(),
            ]);

            $conv = Conversation::create([
                'type'        => 'contract',
                'contract_id' => $c->id,
                'job_id'      => $job->id,
                'title'       => $job->title,
            ]);
            $conv->participants()->attach([$job->client_id, $proposal->freelancer_id]);
            return $c;
        });

        $this->audit->log('proposal.accepted', $request->user()->id, $proposal, ['contract_id' => $contract->id]);

        $this->notifications->send($proposal->freelancer, [
            'type'       => 'contract',
            'title'      => 'Contract created',
            'body'       => "Your proposal for \"{$job->title}\" was accepted. The contract is now active.",
            'action_url' => "/contracts/{$contract->id}",
            'icon'       => 'briefcase',
        ]);

        if (class_exists(\App\Notifications\ContractCreatedNotification::class)) {
            try { $proposal->freelancer?->notify(new \App\Notifications\ContractCreatedNotification($contract)); }
            catch (\Throwable $e) { \Log::warning('ContractCreated notify failed', ['err' => $e->getMessage()]); }
        }

        return response()->json(['message' => 'Proposal accepted, contract created', 'contract_id' => $contract->id]);
    }

    public function reject(Request $request, Proposal $proposal): JsonResponse
    {
        if (! $request->user()->can('decide', $proposal)) {
            throw new AuthorizationException();
        }
        $proposal->update(['status' => 'rejected']);
        $this->audit->log('proposal.rejected', $request->user()->id, $proposal);
        return response()->json(['message' => 'Proposal rejected']);
    }

    public function myProposals(Request $request): JsonResponse
    {
        $proposals = Proposal::with(['job.client.clientProfile', 'job.category'])
            ->where('freelancer_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(10);
        return response()->json(['data' => $proposals]);
    }
}
