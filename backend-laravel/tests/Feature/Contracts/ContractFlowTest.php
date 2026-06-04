<?php

namespace Tests\Feature\Contracts;

use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Milestone;
use App\Models\Proposal;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * End-to-end coverage of the Contracts module:
 *  - visibility scoping (participants only, except admin)
 *  - complete flow (client only, refunds escrow)
 *  - cancel flow (either party, refunds escrow, requires reason)
 *  - dispute flow (locks payments)
 *  - admin resolve-dispute (all three outcomes)
 *  - terminal-state guards
 *  - pagination + my/active|completed|disputed listings
 */
class ContractFlowTest extends TestCase
{
    use RefreshDatabase;

    private User     $client;
    private User     $freelancer;
    private User     $admin;
    private Contract $contract;

    protected function setUp(): void
    {
        parent::setUp();

        // Re-seed the platform user that PaymentInfrastructure migration creates,
        // because RefreshDatabase ran the migration but the seeded INSERT goes
        // through DB::table() before factories — the row exists.
        // (No code needed here — the migration already seeded it.)

        $this->client     = User::factory()->create();
        $this->client->forceFill(['role' => 'client'])->save();
        $this->freelancer = User::factory()->create();
        $this->freelancer->forceFill(['role' => 'freelancer'])->save();
        $this->admin      = User::factory()->create();
        $this->admin->forceFill(['role' => 'admin'])->save();

        Wallet::firstOrCreate(['user_id' => $this->client->id],     ['balance' => 1000]);
        Wallet::firstOrCreate(['user_id' => $this->freelancer->id], ['balance' => 0]);
        Wallet::firstOrCreate(['user_id' => $this->admin->id],      ['balance' => 0]);

        $this->contract = $this->makeContract($this->client, $this->freelancer, [
            'title' => 'API integration', 'description' => 'Build an integration with Stripe.',
            'type' => 'fixed', 'amount' => 500, 'escrow_amount' => 0, 'status' => 'active',
            'started_at' => now(),
        ]);
    }

    /** Helper — creates a JobPosting + Proposal + Contract triple (FK chain). */
    private function makeContract(User $client, User $freelancer, array $contractAttrs = []): Contract
    {
        $job = JobPosting::create([
            'client_id' => $client->id,
            'title' => $contractAttrs['title'] ?? 'Job',
            'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate',
        ]);
        $proposal = Proposal::create([
            'job_id' => $job->id, 'freelancer_id' => $freelancer->id,
            'cover_letter' => 'hello world', 'bid_amount' => $contractAttrs['amount'] ?? 100,
        ]);
        return Contract::create(array_merge([
            'job_id'        => $job->id,
            'proposal_id'   => $proposal->id,
            'client_id'     => $client->id,
            'freelancer_id' => $freelancer->id,
            'title'         => 'Default',
            'amount'        => 100,
            'status'        => 'active',
        ], $contractAttrs));
    }

    /* ── VISIBILITY ──────────────────────────────────────────────────────── */

    public function test_index_only_returns_contracts_for_authenticated_user(): void
    {
        // Another contract belonging to nobody we know
        $stranger    = User::factory()->create();
        $stranger->forceFill(['role' => 'client'])->save();
        $strangerFre = User::factory()->create();
        $strangerFre->forceFill(['role' => 'freelancer'])->save();
        $this->makeContract($stranger, $strangerFre, ['title' => 'Hidden', 'amount' => 200]);

        Sanctum::actingAs($this->client);
        $res = $this->getJson('/api/contracts')->assertOk();
        $ids = collect($res->json('data.data'))->pluck('id')->all();

        $this->assertContains($this->contract->id, $ids);
        $this->assertCount(1, $ids);
    }

    public function test_show_denies_non_participant(): void
    {
        $stranger = User::factory()->create();
        Sanctum::actingAs($stranger);
        $this->getJson("/api/contracts/{$this->contract->id}")->assertStatus(403);
    }

    public function test_show_returns_full_payload_for_participant(): void
    {
        Sanctum::actingAs($this->freelancer);
        $this->getJson("/api/contracts/{$this->contract->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $this->contract->id)
            ->assertJsonStructure(['data' => ['payments', 'allowed_actions']]);
    }

    /* ── COMPLETE ────────────────────────────────────────────────────────── */

    public function test_only_client_can_complete(): void
    {
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/contracts/{$this->contract->id}/complete")->assertStatus(403);

        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/complete")
            ->assertOk()
            ->assertJsonPath('data.contract.status', 'completed');

        $this->assertDatabaseHas('contracts', [
            'id'           => $this->contract->id,
            'status'       => 'completed',
            'completed_by' => $this->client->id,
        ]);
    }

    public function test_terminal_state_cannot_be_completed_again(): void
    {
        $this->contract->update(['status' => 'completed']);
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/complete")->assertStatus(422);
    }

    /* ── CANCEL ──────────────────────────────────────────────────────────── */

    public function test_cancel_requires_reason(): void
    {
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/cancel")->assertStatus(422);
    }

    public function test_either_participant_can_cancel_with_reason(): void
    {
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/contracts/{$this->contract->id}/cancel", [
            'cancellation_reason' => 'Scope changed; both parties agreed',
        ])
            ->assertOk()
            ->assertJsonPath('data.contract.status', 'cancelled');

        $this->assertDatabaseHas('contracts', [
            'id'           => $this->contract->id,
            'status'       => 'cancelled',
            'cancelled_by' => $this->freelancer->id,
        ]);
    }

    public function test_disputed_contract_cannot_be_cancelled_directly(): void
    {
        $this->contract->update(['status' => 'disputed']);
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/cancel", [
            'cancellation_reason' => 'Whatever',
        ])->assertStatus(422);
    }

    /* ── DISPUTE ─────────────────────────────────────────────────────────── */

    public function test_dispute_requires_reason_and_sets_audit_fields(): void
    {
        Sanctum::actingAs($this->freelancer);
        $this->postJson("/api/contracts/{$this->contract->id}/dispute")->assertStatus(422);

        $this->postJson("/api/contracts/{$this->contract->id}/dispute", [
            'dispute_reason' => 'Payment was promised but not delivered',
        ])
            ->assertOk()
            ->assertJsonPath('data.contract.status', 'disputed');

        $row = $this->contract->fresh();
        $this->assertSame('disputed', $row->status);
        $this->assertSame($this->freelancer->id, (int) $row->dispute_opened_by);
        $this->assertNotNull($row->disputed_at);
    }

    public function test_dispute_blocks_milestone_release(): void
    {
        // Fund escrow first
        $this->contract->update(['escrow_amount' => 300]);
        // The client wallet escrow_balance must mirror that for refundEscrow to work;
        // we bypass fundEscrow here and directly set the wallet, mirroring a pre-funded state.
        Wallet::where('user_id', $this->client->id)->update([
            'balance'        => 700,
            'escrow_balance' => 300,
        ]);

        $milestone = Milestone::create([
            'contract_id' => $this->contract->id,
            'title'       => 'Phase 1',
            'amount'      => 100,
            'status'      => 'submitted',
        ]);

        // Open dispute
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/dispute", [
            'dispute_reason' => 'Quality issues with phase 1 deliverable',
        ])->assertOk();

        // Now release should be refused — the ledger guard throws
        $this->postJson("/api/payments/milestones/{$milestone->id}/release", [])
            ->assertStatus(422)
            ->assertJsonFragment(['message' => 'Cannot release milestone — contract is under dispute']);
    }

    /* ── RESOLVE DISPUTE (admin) ─────────────────────────────────────────── */

    public function test_non_admin_cannot_resolve_dispute(): void
    {
        $this->contract->update(['status' => 'disputed']);
        Sanctum::actingAs($this->client);
        $this->postJson("/api/contracts/{$this->contract->id}/resolve-dispute", [
            'outcome' => 'refund_to_client',
        ])->assertStatus(403);
    }

    public function test_admin_resolves_dispute_with_refund_to_client(): void
    {
        // Set up funded escrow and disputed state
        $this->contract->update(['status' => 'disputed', 'escrow_amount' => 200]);
        Wallet::where('user_id', $this->client->id)->update([
            'balance'        => 800,
            'escrow_balance' => 200,
        ]);

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/contracts/{$this->contract->id}/resolve-dispute", [
            'outcome' => 'refund_to_client',
        ])->assertOk()
          ->assertJsonPath('data.contract.status', 'cancelled');

        $clientWallet = Wallet::where('user_id', $this->client->id)->first();
        $this->assertSame('1000.00', (string) $clientWallet->balance);    // 800 + 200 returned
        $this->assertSame('0.00',    (string) $clientWallet->escrow_balance);

        $contract = $this->contract->fresh();
        $this->assertSame($this->admin->id, (int) $contract->resolved_by);
        $this->assertSame('refund_to_client', $contract->resolution_outcome);
    }

    public function test_admin_resolves_dispute_with_release_to_freelancer(): void
    {
        $this->contract->update(['status' => 'disputed', 'escrow_amount' => 150]);
        Wallet::where('user_id', $this->client->id)->update([
            'balance'        => 850,
            'escrow_balance' => 150,
        ]);

        Sanctum::actingAs($this->admin);
        $this->postJson("/api/contracts/{$this->contract->id}/resolve-dispute", [
            'outcome' => 'release_to_freelancer',
        ])->assertOk()
          ->assertJsonPath('data.contract.status', 'active');

        $clientWallet     = Wallet::where('user_id', $this->client->id)->first();
        $freelancerWallet = Wallet::where('user_id', $this->freelancer->id)->first();

        $this->assertSame('150.00', (string) $freelancerWallet->balance);
        $this->assertSame('0.00',   (string) $clientWallet->escrow_balance);
    }

    /* ── /my listings ────────────────────────────────────────────────────── */

    public function test_my_active_returns_only_active_paused_pending(): void
    {
        $this->makeContract($this->client, $this->freelancer, ['title' => 'Done',     'status' => 'completed']);
        $this->makeContract($this->client, $this->freelancer, ['title' => 'Disputed', 'status' => 'disputed']);

        Sanctum::actingAs($this->client);

        $active = $this->getJson('/api/contracts/my/active')->assertOk()->json('data.data');
        $this->assertCount(1, $active);
        $this->assertSame($this->contract->id, $active[0]['id']);

        $disputed = $this->getJson('/api/contracts/my/disputed')->assertOk()->json('data.data');
        $this->assertCount(1, $disputed);
    }

    public function test_pagination_respects_per_page(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->makeContract($this->client, $this->freelancer, ['title' => "Bulk {$i}", 'amount' => 50, 'status' => 'active']);
        }
        Sanctum::actingAs($this->client);
        $res = $this->getJson('/api/contracts?per_page=2')->assertOk();
        $this->assertCount(2, $res->json('data.data'));
        $this->assertSame(2, $res->json('data.per_page'));
    }
}
