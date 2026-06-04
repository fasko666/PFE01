<?php

namespace App\Http\Controllers\API\Contracts;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\ContractExtension;
use App\Models\Milestone;
use App\Services\ContractActivityService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContractExtensionController extends Controller
{
    public function __construct(
        private NotificationService     $notify,
        private ContractActivityService $activity,
    ) {}

    public function index(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        return response()->json(['data' => $contract->extensions()->with('requester:id,name,avatar')->get()]);
    }

    public function store(Request $request, Contract $contract): JsonResponse
    {
        $this->guard($request, $contract);
        if (! $contract->hasParticipant($request->user()->id)) {
            return response()->json(['message' => 'Only participants can request extensions'], 403);
        }
        $data = $request->validate([
            'new_deadline'      => 'nullable|date|after:today',
            'additional_budget' => 'nullable|numeric|min:0',
            'new_milestones'    => 'nullable|array',
            'new_milestones.*.title'  => 'required|string',
            'new_milestones.*.amount' => 'required|numeric|min:0',
            'new_milestones.*.due_at' => 'nullable|date',
            'reason'            => 'required|string|min:5|max:2000',
        ]);
        $ext = ContractExtension::create(array_merge($data, [
            'contract_id'  => $contract->id,
            'requested_by' => $request->user()->id,
            'status'       => 'pending',
        ]));
        $this->activity->log($contract, $request->user()->id, 'extension.requested', ['extension_id' => $ext->id]);
        $other = (int) $request->user()->id === (int) $contract->client_id ? $contract->freelancer : $contract->client;
        if ($other) {
            $this->notify->send($other, [
                'type' => 'contract', 'title' => 'Contract extension requested',
                'body' => "{$request->user()->name} requested changes to \"{$contract->title}\".",
                'action_url' => "/contracts/{$contract->id}", 'icon' => 'calendar-plus',
            ]);
        }
        return response()->json(['data' => $ext], 201);
    }

    /** Other party responds: accept (applies changes) or reject. */
    public function respond(Request $request, ContractExtension $extension): JsonResponse
    {
        $contract = $extension->contract;
        $this->guard($request, $contract);
        if ((int) $extension->requested_by === (int) $request->user()->id) {
            return response()->json(['message' => 'You cannot respond to your own request'], 422);
        }
        if ($extension->status !== 'pending') {
            return response()->json(['message' => 'This request was already resolved'], 422);
        }
        $data = $request->validate([
            'action'         => 'required|in:accept,reject',
            'response_notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($extension, $contract, $request, $data) {
            $extension->update([
                'status'         => $data['action'] === 'accept' ? 'accepted' : 'rejected',
                'responded_by'   => $request->user()->id,
                'responded_at'   => now(),
                'response_notes' => $data['response_notes'] ?? null,
            ]);

            if ($data['action'] === 'accept') {
                $updates = [];
                if ($extension->new_deadline)      $updates['deadline_at'] = $extension->new_deadline;
                if ((float) $extension->additional_budget > 0) {
                    $updates['amount'] = bcadd((string) $contract->amount, (string) $extension->additional_budget, 2);
                }
                if (! empty($updates)) $contract->update($updates);

                foreach ($extension->new_milestones ?? [] as $m) {
                    Milestone::create([
                        'contract_id' => $contract->id,
                        'title'       => $m['title'],
                        'amount'      => $m['amount'],
                        'due_at'      => $m['due_at'] ?? null,
                        'status'      => 'pending',
                        'sort_order'  => $contract->milestones()->count(),
                    ]);
                }
            }
        });

        $this->activity->log($contract, $request->user()->id, 'extension.'.$data['action'].'ed',
            ['extension_id' => $extension->id]);
        $this->notify->send($extension->requester, [
            'type' => 'contract', 'title' => "Extension {$data['action']}ed",
            'body' => "Your extension request for \"{$contract->title}\" was {$data['action']}ed.",
            'action_url' => "/contracts/{$contract->id}", 'icon' => 'calendar',
        ]);

        return response()->json(['data' => $extension->fresh()]);
    }

    private function guard(Request $request, Contract $contract): void
    {
        if (! $request->user()->can('view', $contract)) {
            abort(response()->json(['message' => 'Forbidden'], 403));
        }
    }
}
