<?php

namespace App\Http\Controllers\API\Jobs;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\Contract;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProposalController extends Controller
{
    public function index(Request $request, JobPosting $job): JsonResponse
    {
        if ($job->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $proposals = Proposal::with(['freelancer.freelancerProfile', 'freelancer.skills'])
            ->where('job_id', $job->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json(['data' => $proposals]);
    }

    public function store(Request $request, JobPosting $job): JsonResponse
    {
        if (!$request->user()->isFreelancer()) {
            return response()->json(['message' => 'Only freelancers can submit proposals'], 403);
        }

        if (Proposal::where('job_id', $job->id)->where('freelancer_id', $request->user()->id)->exists()) {
            return response()->json(['message' => 'You already submitted a proposal for this job'], 409);
        }

        $validator = Validator::make($request->all(), [
            'cover_letter' => 'required|string|min:10',
            'bid_amount'   => 'required|numeric|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $proposal = Proposal::create([
            'job_id'             => $job->id,
            'freelancer_id'      => $request->user()->id,
            'cover_letter'       => $request->cover_letter,
            'bid_amount'         => $request->bid_amount,
            'estimated_duration' => $request->estimated_days ?? $request->estimated_duration ?? null,
            'status'             => 'pending',
            'connects_used'      => 2,
            'is_ai_generated'    => $request->boolean('is_ai_generated'),
        ]);

        $job->increment('proposals_count');

        return response()->json(['data' => $proposal->load('freelancer')], 201);
    }

    public function accept(Request $request, Proposal $proposal): JsonResponse
    {
        $job = $proposal->job;
        if ($job->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        DB::transaction(function () use ($proposal, $job, $request) {
            $proposal->update(['status' => 'accepted']);
            $job->update(['status' => 'in_progress']);

            $contract = Contract::create([
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

            // Create conversation for the contract
            $conversation = Conversation::create([
                'type'        => 'contract',
                'contract_id' => $contract->id,
                'job_id'      => $job->id,
                'title'       => $job->title,
            ]);
            $conversation->participants()->attach([$job->client_id, $proposal->freelancer_id]);
        });

        return response()->json(['message' => 'Proposal accepted, contract created']);
    }

    public function reject(Request $request, Proposal $proposal): JsonResponse
    {
        if ($proposal->job->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $proposal->update(['status' => 'rejected']);
        return response()->json(['message' => 'Proposal rejected']);
    }

    public function myProposals(Request $request): JsonResponse
    {
        $proposals = Proposal::with(['job.client.clientProfile', 'job.category'])
            ->where('freelancer_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);
        return response()->json(['data' => $proposals]);
    }
}
