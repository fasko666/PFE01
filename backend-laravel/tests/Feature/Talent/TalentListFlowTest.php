<?php

namespace Tests\Feature\Talent;

use App\Models\TalentList;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TalentListFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_save_and_unsave_freelancer(): void
    {
        $client     = $this->mk('client');
        $freelancer = $this->mk('freelancer');

        Sanctum::actingAs($client);
        $this->postJson('/api/saved-freelancers', ['freelancer_id' => $freelancer->id])->assertStatus(201);
        $this->assertDatabaseHas('saved_freelancers', ['user_id' => $client->id, 'freelancer_id' => $freelancer->id]);

        $this->getJson("/api/saved-freelancers/check/{$freelancer->id}")->assertOk()->assertJsonPath('data.saved', true);

        $this->deleteJson("/api/saved-freelancers/{$freelancer->id}")->assertOk();
        $this->assertDatabaseMissing('saved_freelancers', ['user_id' => $client->id, 'freelancer_id' => $freelancer->id]);
    }

    public function test_user_cannot_save_self(): void
    {
        $u = $this->mk('client');
        Sanctum::actingAs($u);
        $this->postJson('/api/saved-freelancers', ['freelancer_id' => $u->id])->assertStatus(422);
    }

    public function test_talent_list_full_lifecycle(): void
    {
        $client     = $this->mk('client');
        $freelancer = $this->mk('freelancer');
        Sanctum::actingAs($client);

        // create
        $res = $this->postJson('/api/talent-lists', [
            'name' => 'React devs Q3', 'description' => 'Candidates for the dashboard rewrite',
        ])->assertStatus(201);
        $listId = $res->json('data.id');

        // add member
        $this->postJson("/api/talent-lists/{$listId}/members", [
            'freelancer_id' => $freelancer->id, 'note' => 'Great portfolio',
        ])->assertOk();

        $this->assertDatabaseHas('talent_list_freelancers', [
            'talent_list_id' => $listId, 'freelancer_id' => $freelancer->id,
        ]);

        // get
        $this->getJson("/api/talent-lists/{$listId}")
            ->assertOk()
            ->assertJsonPath('data.name', 'React devs Q3')
            ->assertJsonCount(1, 'data.freelancers');

        // update
        $this->putJson("/api/talent-lists/{$listId}", ['name' => 'Renamed'])->assertOk()
            ->assertJsonPath('data.name', 'Renamed');

        // remove member
        $this->deleteJson("/api/talent-lists/{$listId}/members/{$freelancer->id}")->assertOk();
        $this->assertDatabaseMissing('talent_list_freelancers', [
            'talent_list_id' => $listId, 'freelancer_id' => $freelancer->id,
        ]);

        // delete
        $this->deleteJson("/api/talent-lists/{$listId}")->assertOk();
        $this->assertDatabaseMissing('talent_lists', ['id' => $listId]);
    }

    public function test_user_cannot_modify_someone_elses_list(): void
    {
        $owner    = $this->mk('client');
        $stranger = $this->mk('freelancer');
        $list = TalentList::create(['user_id' => $owner->id, 'name' => 'Mine']);

        Sanctum::actingAs($stranger);
        $this->getJson("/api/talent-lists/{$list->id}")->assertStatus(403);
        $this->putJson("/api/talent-lists/{$list->id}", ['name' => 'hacked'])->assertStatus(403);
        $this->deleteJson("/api/talent-lists/{$list->id}")->assertStatus(403);
    }

    private function mk(string $role): User
    {
        $u = User::factory()->create();
        $u->forceFill(['role' => $role])->save();
        return $u;
    }
}
