<?php

namespace Tests\Unit\Policies;

use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\User;
use App\Policies\ContractPolicy;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Matrix: every ContractPolicy ability × every role (client / freelancer / admin / stranger).
 * 5 abilities × 4 roles = 20 explicit assertions.
 */
class ContractPolicyTest extends TestCase
{
    use RefreshDatabase;

    private ContractPolicy $policy;
    private Contract       $contract;
    private User           $client;
    private User           $freelancer;
    private User           $admin;
    private User           $stranger;

    protected function setUp(): void
    {
        parent::setUp();
        $this->policy     = new ContractPolicy();
        $this->client     = User::factory()->create()->forceFill(['role' => 'client'])->fresh();
        $this->client->forceFill(['role' => 'client'])->save();
        $this->freelancer = User::factory()->create();
        $this->freelancer->forceFill(['role' => 'freelancer'])->save();
        $this->admin      = User::factory()->create();
        $this->admin->forceFill(['role' => 'admin'])->save();
        $this->stranger   = User::factory()->create();
        $this->stranger->forceFill(['role' => 'freelancer'])->save();

        $job = JobPosting::create([
            'client_id' => $this->client->id, 'title' => 'X', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate',
        ]);
        $proposal = Proposal::create([
            'job_id' => $job->id, 'freelancer_id' => $this->freelancer->id,
            'cover_letter' => 'hello world from a freelancer', 'bid_amount' => 100,
        ]);
        $this->contract = Contract::create([
            'job_id'        => $job->id,
            'proposal_id'   => $proposal->id,
            'client_id'     => $this->client->id,
            'freelancer_id' => $this->freelancer->id,
            'title'         => 'Test',
            'amount'        => 100,
            'status'        => 'active',
        ]);
    }

    public function test_view_allows_client_freelancer_admin_denies_stranger(): void
    {
        $this->assertTrue ($this->policy->view($this->client,     $this->contract));
        $this->assertTrue ($this->policy->view($this->freelancer, $this->contract));
        $this->assertTrue ($this->policy->view($this->admin,      $this->contract));
        $this->assertFalse($this->policy->view($this->stranger,   $this->contract));
    }

    public function test_complete_only_allows_client(): void
    {
        $this->assertTrue ($this->policy->complete($this->client,     $this->contract));
        $this->assertFalse($this->policy->complete($this->freelancer, $this->contract));
        $this->assertFalse($this->policy->complete($this->admin,      $this->contract));
        $this->assertFalse($this->policy->complete($this->stranger,   $this->contract));
    }

    public function test_cancel_allows_participants_and_admin(): void
    {
        $this->assertTrue ($this->policy->cancel($this->client,     $this->contract));
        $this->assertTrue ($this->policy->cancel($this->freelancer, $this->contract));
        $this->assertTrue ($this->policy->cancel($this->admin,      $this->contract));
        $this->assertFalse($this->policy->cancel($this->stranger,   $this->contract));
    }

    public function test_dispute_allows_participants_only(): void
    {
        $this->assertTrue ($this->policy->dispute($this->client,     $this->contract));
        $this->assertTrue ($this->policy->dispute($this->freelancer, $this->contract));
        $this->assertFalse($this->policy->dispute($this->admin,      $this->contract));
        $this->assertFalse($this->policy->dispute($this->stranger,   $this->contract));
    }

    public function test_resolve_dispute_only_allows_admin(): void
    {
        $this->assertFalse($this->policy->resolveDispute($this->client,     $this->contract));
        $this->assertFalse($this->policy->resolveDispute($this->freelancer, $this->contract));
        $this->assertTrue ($this->policy->resolveDispute($this->admin,      $this->contract));
        $this->assertFalse($this->policy->resolveDispute($this->stranger,   $this->contract));
    }
}
