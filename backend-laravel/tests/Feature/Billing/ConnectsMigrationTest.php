<?php

namespace Tests\Feature\Billing;

use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ConnectsMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_users_have_connects_balance_column_with_default(): void
    {
        $u = User::factory()->create();
        $this->assertSame(10, (int) $u->connects_balance);
    }

    public function test_proposal_submit_decrements_connects_from_user(): void
    {
        $client     = User::factory()->create();
        $freelancer = User::factory()->create();
        $client->forceFill(['role' => 'client'])->save();
        $freelancer->forceFill(['role' => 'freelancer', 'connects_balance' => 10])->save();

        $job = JobPosting::create([
            'client_id' => $client->id, 'title' => 'X', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate', 'status' => 'open', 'visibility' => 'public',
        ]);

        Sanctum::actingAs($freelancer);
        $this->postJson("/api/jobs/{$job->id}/proposals", [
            'cover_letter' => 'Hello, I would love to work on this',
            'bid_amount'   => 100,
        ])->assertStatus(201);

        $this->assertSame(8, (int) $freelancer->fresh()->connects_balance);
    }

    public function test_proposal_submit_refuses_when_insufficient_connects(): void
    {
        $client     = User::factory()->create();
        $freelancer = User::factory()->create();
        $client->forceFill(['role' => 'client'])->save();
        $freelancer->forceFill(['role' => 'freelancer', 'connects_balance' => 1])->save();

        $job = JobPosting::create([
            'client_id' => $client->id, 'title' => 'X', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate', 'status' => 'open', 'visibility' => 'public',
        ]);

        Sanctum::actingAs($freelancer);
        $this->postJson("/api/jobs/{$job->id}/proposals", [
            'cover_letter' => 'Hello there',
            'bid_amount'   => 100,
        ])->assertStatus(422)->assertJsonFragment(['code' => 'INSUFFICIENT_CONNECTS']);

        $this->assertSame(1, (int) $freelancer->fresh()->connects_balance);
    }

    public function test_proposal_withdraw_refunds_connects(): void
    {
        $client     = User::factory()->create();
        $freelancer = User::factory()->create();
        $client->forceFill(['role' => 'client'])->save();
        $freelancer->forceFill(['role' => 'freelancer', 'connects_balance' => 10])->save();

        $job = JobPosting::create([
            'client_id' => $client->id, 'title' => 'X', 'description' => str_repeat('x', 60),
            'type' => 'fixed', 'experience_level' => 'intermediate', 'status' => 'open', 'visibility' => 'public',
        ]);

        Sanctum::actingAs($freelancer);
        $this->postJson("/api/jobs/{$job->id}/proposals", ['cover_letter' => 'Hello, I would love to work on this project', 'bid_amount' => 100])->assertStatus(201);
        $this->assertSame(8, (int) $freelancer->fresh()->connects_balance);

        $proposal = Proposal::where('freelancer_id', $freelancer->id)->first();
        $this->postJson("/api/proposals/{$proposal->id}/withdraw")
            ->assertOk()
            ->assertJsonPath('data.connects_refunded', 2);

        $this->assertSame(10, (int) $freelancer->fresh()->connects_balance);
    }
}
