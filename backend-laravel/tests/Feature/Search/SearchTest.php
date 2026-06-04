<?php

namespace Tests\Feature\Search;

use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_finds_jobs_by_title(): void
    {
        $client = User::factory()->create();
        $client->forceFill(['role' => 'client'])->save();
        JobPosting::create([
            'client_id' => $client->id, 'title' => 'React Native dashboard',
            'description' => 'Build a fintech mobile dashboard', 'type' => 'fixed',
            'experience_level' => 'intermediate', 'status' => 'open', 'visibility' => 'public',
        ]);

        $this->getJson('/api/search?q=react&type=jobs')
            ->assertOk()
            ->assertJsonCount(1, 'data.jobs');
    }

    public function test_search_freelancers_by_name(): void
    {
        $u = User::factory()->create(['name' => 'Ada Lovelace']);
        $u->forceFill(['role' => 'freelancer', 'is_active' => true])->save();

        $this->getJson('/api/search?q=ada&type=freelancers')
            ->assertOk()
            ->assertJsonCount(1, 'data.freelancers');
    }

    public function test_suggest_returns_jobs_and_freelancers(): void
    {
        $u = User::factory()->create(['name' => 'Marie Curie']);
        $u->forceFill(['role' => 'freelancer', 'is_active' => true])->save();
        JobPosting::create([
            'client_id' => $u->id, 'title' => 'Marie Kondo expert',
            'description' => 'Org', 'type' => 'fixed', 'experience_level' => 'entry',
            'status' => 'open', 'visibility' => 'public',
        ]);

        $res = $this->getJson('/api/search/suggest?q=mari')->assertOk();
        $this->assertTrue(count($res->json('data.jobs')) > 0 || count($res->json('data.freelancers')) > 0);
    }

    public function test_messages_are_scoped_to_participant(): void
    {
        // Build a message in a conversation the user is NOT part of and confirm it's not returned.
        $a = User::factory()->create();
        $b = User::factory()->create();
        $stranger = User::factory()->create();

        $conv = \App\Models\Conversation::create(['type' => 'direct']);
        $conv->participants()->attach([$a->id, $b->id]);
        \App\Models\Message::create([
            'conversation_id' => $conv->id, 'sender_id' => $a->id,
            'body' => 'pineapple pizza', 'type' => 'text',
        ]);

        Sanctum::actingAs($stranger);
        $res = $this->getJson('/api/search?q=pineapple&type=messages')->assertOk();
        $this->assertCount(0, $res->json('data.messages'));

        Sanctum::actingAs($a);
        $res = $this->getJson('/api/search?q=pineapple&type=messages')->assertOk();
        $this->assertCount(1, $res->json('data.messages'));
    }
}
