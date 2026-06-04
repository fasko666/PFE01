<?php

namespace Tests\Unit\Policies;

use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Milestone;
use App\Models\Proposal;
use App\Models\User;
use App\Policies\MilestonePolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MilestonePolicyTest extends TestCase
{
    use RefreshDatabase;

    private MilestonePolicy $policy;
    private User $client;
    private User $freelancer;
    private User $admin;
    private User $stranger;
    private Contract $contract;
    private Milestone $milestone;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy = new MilestonePolicy();

        $this->client     = $this->makeUser('client');
        $this->freelancer = $this->makeUser('freelancer');
        $this->admin      = $this->makeUser('admin');
        $this->stranger   = $this->makeUser('freelancer');

        $job = JobPosting::create([
            'client_id' => $this->client->id, 'title' => 'Job', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate',
        ]);
        $proposal = Proposal::create([
            'job_id' => $job->id, 'freelancer_id' => $this->freelancer->id,
            'cover_letter' => 'hi', 'bid_amount' => 100,
        ]);
        $this->contract = Contract::create([
            'job_id' => $job->id, 'proposal_id' => $proposal->id,
            'client_id' => $this->client->id, 'freelancer_id' => $this->freelancer->id,
            'title' => 'C', 'amount' => 100, 'status' => 'active',
        ]);
        $this->milestone = Milestone::create([
            'contract_id' => $this->contract->id,
            'title' => 'M1', 'amount' => 100, 'status' => 'pending',
        ]);
    }

    private function makeUser(string $role): User
    {
        $u = User::factory()->create();
        $u->forceFill(['role' => $role])->save();
        return $u;
    }

    public function test_view_allows_participants_and_admin_denies_stranger(): void
    {
        $this->assertTrue ($this->policy->view($this->client,     $this->milestone));
        $this->assertTrue ($this->policy->view($this->freelancer, $this->milestone));
        $this->assertTrue ($this->policy->view($this->admin,      $this->milestone));
        $this->assertFalse($this->policy->view($this->stranger,   $this->milestone));
    }

    public function test_create_only_allows_client(): void
    {
        $this->assertTrue ($this->policy->create($this->client,     $this->contract));
        $this->assertFalse($this->policy->create($this->freelancer, $this->contract));
        $this->assertFalse($this->policy->create($this->admin,      $this->contract));
        $this->assertFalse($this->policy->create($this->stranger,   $this->contract));
    }

    public function test_update_denied_when_paid_or_approved(): void
    {
        $this->assertTrue($this->policy->update($this->client, $this->milestone));     // pending → ok

        $this->milestone->update(['status' => 'paid']);
        $this->assertFalse($this->policy->update($this->client, $this->milestone->fresh()));

        $this->milestone->update(['status' => 'approved']);
        $this->assertFalse($this->policy->update($this->client, $this->milestone->fresh()));
    }

    public function test_delete_denied_when_paid_approved_or_submitted(): void
    {
        $this->assertTrue($this->policy->delete($this->client, $this->milestone));    // pending → ok

        foreach (['submitted', 'approved', 'paid'] as $bad) {
            $this->milestone->update(['status' => $bad]);
            $this->assertFalse($this->policy->delete($this->client, $this->milestone->fresh()), "Should deny delete when {$bad}");
        }
    }

    public function test_submit_only_allows_freelancer(): void
    {
        $this->assertTrue ($this->policy->submit($this->freelancer, $this->milestone));
        $this->assertFalse($this->policy->submit($this->client,     $this->milestone));
        $this->assertFalse($this->policy->submit($this->admin,      $this->milestone));
        $this->assertFalse($this->policy->submit($this->stranger,   $this->milestone));
    }

    public function test_approve_only_allows_client(): void
    {
        $this->assertTrue ($this->policy->approve($this->client,     $this->milestone));
        $this->assertFalse($this->policy->approve($this->freelancer, $this->milestone));
        $this->assertFalse($this->policy->approve($this->admin,      $this->milestone));
        $this->assertFalse($this->policy->approve($this->stranger,   $this->milestone));
    }

    public function test_reject_only_allows_client(): void
    {
        $this->assertTrue ($this->policy->reject($this->client,     $this->milestone));
        $this->assertFalse($this->policy->reject($this->freelancer, $this->milestone));
        $this->assertFalse($this->policy->reject($this->admin,      $this->milestone));
        $this->assertFalse($this->policy->reject($this->stranger,   $this->milestone));
    }
}
