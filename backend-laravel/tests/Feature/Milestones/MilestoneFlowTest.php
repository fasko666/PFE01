<?php

namespace Tests\Feature\Milestones;

use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Milestone;
use App\Models\Proposal;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MilestoneFlowTest extends TestCase
{
    use RefreshDatabase;

    private User     $client;
    private User     $freelancer;
    private User     $admin;
    private Contract $contract;

    protected function setUp(): void
    {
        parent::setUp();
        $this->client     = $this->mkUser('client');
        $this->freelancer = $this->mkUser('freelancer');
        $this->admin      = $this->mkUser('admin');

        Wallet::firstOrCreate(['user_id' => $this->client->id],     ['balance' => 1000]);
        Wallet::firstOrCreate(['user_id' => $this->freelancer->id], ['balance' => 0]);

        $this->contract = $this->mkContract($this->client, $this->freelancer);
    }

    /* ── CREATE ─────────────────────────────────────────────────────────── */

    public function test_only_client_can_create_a_milestone(): void
    {
        $body = [
            'title' => 'Phase 1', 'description' => 'Build the dashboard',
            'amount' => 250, 'due_date' => now()->addDays(7)->toDateString(),
        ];

        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/contracts/{$this->contract->id}/milestones", $body)->assertStatus(403);

        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/milestones", $body)
            ->assertStatus(201)
            ->assertJsonPath('data.title',  'Phase 1')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('milestones', [
            'contract_id' => $this->contract->id,
            'title'       => 'Phase 1',
            'amount'      => 250,
            'created_by'  => $this->client->id,
        ]);
    }

    public function test_create_validates_required_fields(): void
    {
        Sanctum::actingAs($this->client);
        $res = $this->postJson("/api/contracts/{$this->contract->id}/milestones", [])
            ->assertStatus(422);
        // title, description, amount, due_date required
        foreach (['title', 'description', 'amount'] as $f) {
            $this->assertArrayHasKey($f, $res->json('errors'));
        }
    }

    public function test_create_rejects_past_due_date(): void
    {
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/milestones", [
            'title' => 't', 'description' => 'desc here', 'amount' => 50,
            'due_date' => now()->subDays(1)->toDateString(),
        ])->assertStatus(422)->assertJsonValidationErrors('due_date');
    }

    public function test_create_rejects_terminal_contract(): void
    {
        $this->contract->update(['status' => 'completed']);
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/milestones", [
            'title' => 't', 'description' => 'desc here', 'amount' => 50,
            'due_date' => now()->addDays(7)->toDateString(),
        ])->assertStatus(422);
    }

    /* ── LIST + SHOW ────────────────────────────────────────────────────── */

    public function test_index_returns_paginated_milestones(): void
    {
        Milestone::create(['contract_id' => $this->contract->id, 'title' => 'A', 'amount' => 10, 'status' => 'pending']);
        Milestone::create(['contract_id' => $this->contract->id, 'title' => 'B', 'amount' => 20, 'status' => 'pending']);

        Sanctum::actingAs($this->freelancer);
        $res = $this->getJson("/api/contracts/{$this->contract->id}/milestones")->assertOk();
        $this->assertCount(2, $res->json('data.data'));
    }

    public function test_index_denies_non_participant(): void
    {
        $stranger = $this->mkUser('freelancer');
        Sanctum::actingAs($stranger);
        $this->getJson("/api/contracts/{$this->contract->id}/milestones")->assertStatus(403);
    }

    public function test_show_returns_full_payload_with_allowed_actions(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'X', 'amount' => 10, 'status' => 'submitted', 'submitted_at' => now()]);
        Sanctum::actingAs($this->client);
        $this->getJson("/api/milestones/{$m->id}")
            ->assertOk()
            ->assertJsonStructure(['data' => ['allowed_actions', 'activities', 'payments']])
            ->assertJsonPath('data.allowed_actions.approve', true)
            ->assertJsonPath('data.allowed_actions.reject',  true);
    }

    /* ── SUBMIT ─────────────────────────────────────────────────────────── */

    public function test_freelancer_submits_with_message(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'S', 'amount' => 10, 'status' => 'in_progress']);
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/milestones/{$m->id}/submit", ['submission_message' => 'Done. PR linked.'])
            ->assertOk()
            ->assertJsonPath('data.status', 'submitted');
        $row = $m->fresh();
        $this->assertSame((int) $this->freelancer->id, (int) $row->submitted_by);
        $this->assertNotNull($row->submitted_at);
        $this->assertSame('Done. PR linked.', $row->submission_notes);
    }

    public function test_client_cannot_submit(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'S', 'amount' => 10, 'status' => 'pending']);
        Sanctum::actingAs($this->client);
        $this->postJson("/api/milestones/{$m->id}/submit", ['submission_message' => 'looks good'])
            ->assertStatus(403);
    }

    public function test_submit_requires_message(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'S', 'amount' => 10, 'status' => 'pending']);
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/milestones/{$m->id}/submit", [])->assertStatus(422)->assertJsonValidationErrors('submission_message');
    }

    /* ── APPROVE → ESCROW RELEASE ───────────────────────────────────────── */

    public function test_approve_releases_escrow_via_ledger(): void
    {
        // Pre-fund escrow: client has $300 in escrow_balance, contract has matching escrow_amount.
        Wallet::where('user_id', $this->client->id)->update(['balance' => 700, 'escrow_balance' => 300]);
        $this->contract->update(['escrow_amount' => 300]);

        $m = Milestone::create([
            'contract_id' => $this->contract->id, 'title' => 'P1',
            'amount' => 200, 'status' => 'submitted', 'submitted_at' => now(),
        ]);

        Sanctum::actingAs($this->client);
        $res = $this->postJson("/api/milestones/{$m->id}/approve")->assertOk();

        $this->assertSame('paid', $m->fresh()->status);
        $this->assertNotNull($m->fresh()->approved_at);

        $freelancerWallet = Wallet::where('user_id', $this->freelancer->id)->first();
        // Default fee is 10% per platform_settings seed → payout = 180, commission = 20
        $this->assertSame('180.00', (string) $freelancerWallet->balance);

        // Contract escrow decreased by milestone amount
        $this->assertSame('100.00', (string) $this->contract->fresh()->escrow_amount);

        // Tx row was created for the freelancer
        $this->assertDatabaseHas('transactions', [
            'milestone_id' => $m->id, 'user_id' => $this->freelancer->id, 'type' => 'credit', 'status' => 'completed',
        ]);
    }

    public function test_approve_blocked_when_contract_disputed(): void
    {
        Wallet::where('user_id', $this->client->id)->update(['balance' => 700, 'escrow_balance' => 300]);
        $this->contract->update(['escrow_amount' => 300, 'status' => 'disputed']);
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'X', 'amount' => 100, 'status' => 'submitted']);

        Sanctum::actingAs($this->client);
        $this->postJson("/api/milestones/{$m->id}/approve")
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Cannot release milestone — contract is under dispute']);
    }

    public function test_only_client_can_approve(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'X', 'amount' => 10, 'status' => 'submitted']);
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/milestones/{$m->id}/approve")->assertStatus(403);
    }

    public function test_cannot_approve_non_submitted(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'X', 'amount' => 10, 'status' => 'in_progress']);
        Sanctum::actingAs($this->client);
        $this->postJson("/api/milestones/{$m->id}/approve")->assertStatus(422);
    }

    /* ── REJECT ─────────────────────────────────────────────────────────── */

    public function test_reject_requires_reason_and_sets_state(): void
    {
        $m = Milestone::create(['contract_id' => $this->contract->id, 'title' => 'X', 'amount' => 10, 'status' => 'submitted']);
        Sanctum::actingAs($this->client);

        $this->postJson("/api/milestones/{$m->id}/reject", [])->assertStatus(422);

        $this->postJson("/api/milestones/{$m->id}/reject", ['rejection_reason' => 'Quality is below spec'])
            ->assertOk()
            ->assertJsonPath('data.status', 'rejected');

        $row = $m->fresh();
        $this->assertSame('Quality is below spec', $row->rejection_reason);
    }

    public function test_freelancer_can_resubmit_after_rejection(): void
    {
        $m = Milestone::create([
            'contract_id' => $this->contract->id, 'title' => 'X', 'amount' => 10,
            'status' => 'rejected', 'rejection_reason' => 'Try again',
        ]);
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/milestones/{$m->id}/submit", ['submission_message' => 'Fixed and resubmitted'])
            ->assertOk()
            ->assertJsonPath('data.status', 'submitted');

        $this->assertNull($m->fresh()->rejection_reason);  // cleared on resubmit
    }

    /* ── helpers ────────────────────────────────────────────────────────── */

    private function mkUser(string $role): User
    {
        $u = User::factory()->create();
        $u->forceFill(['role' => $role])->save();
        return $u;
    }

    private function mkContract(User $client, User $freelancer): Contract
    {
        $job = JobPosting::create([
            'client_id' => $client->id, 'title' => 'J', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate',
        ]);
        $proposal = Proposal::create([
            'job_id' => $job->id, 'freelancer_id' => $freelancer->id, 'cover_letter' => 'hi', 'bid_amount' => 100,
        ]);
        return Contract::create([
            'job_id' => $job->id, 'proposal_id' => $proposal->id,
            'client_id' => $client->id, 'freelancer_id' => $freelancer->id,
            'title' => 'C', 'amount' => 500, 'status' => 'active',
        ]);
    }
}
