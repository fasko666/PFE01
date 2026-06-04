<?php

namespace Tests\Feature\Agency;

use App\Models\Agency;
use App\Models\AgencyInvitation;
use App\Models\AgencyMember;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AgencyFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_creates_agency_and_becomes_owner(): void
    {
        $u = User::factory()->create();
        Sanctum::actingAs($u);

        $this->postJson('/api/agencies', [
            'name' => 'Acme Studio', 'slug' => 'acme-studio',
            'description' => 'Design agency',
        ])->assertStatus(201)->assertJsonPath('data.name', 'Acme Studio');

        $this->assertDatabaseHas('agency_members', [
            'agency_id' => 1, 'user_id' => $u->id, 'role' => 'owner',
        ]);
    }

    public function test_owner_can_invite_and_invitee_can_accept(): void
    {
        $owner = User::factory()->create();
        Sanctum::actingAs($owner);
        $agency = $this->createAgency($owner, 'Studio', 'studio');

        $invitee = User::factory()->create(['email' => 'fl@example.com']);
        $this->postJson("/api/agencies/{$agency->id}/invitations", [
            'email' => 'fl@example.com', 'role' => 'freelancer',
        ])->assertStatus(201);

        $invitation = AgencyInvitation::where('email', 'fl@example.com')->first();
        $this->assertNotNull($invitation);

        Sanctum::actingAs($invitee);
        $this->postJson("/api/agencies/invitations/{$invitation->token}/accept")
            ->assertOk()
            ->assertJsonPath('data.accepted', true);

        $this->assertDatabaseHas('agency_members', [
            'agency_id' => $agency->id, 'user_id' => $invitee->id, 'role' => 'freelancer',
        ]);
    }

    public function test_invitation_for_wrong_email_is_rejected(): void
    {
        $owner = User::factory()->create();
        $agency = $this->createAgency($owner, 'X', 'x');
        $intended = User::factory()->create(['email' => 'right@example.com']);
        $wrong    = User::factory()->create(['email' => 'wrong@example.com']);

        Sanctum::actingAs($owner);
        $this->postJson("/api/agencies/{$agency->id}/invitations", [
            'email' => 'right@example.com', 'role' => 'freelancer',
        ])->assertStatus(201);

        $invitation = AgencyInvitation::where('email', 'right@example.com')->first();
        Sanctum::actingAs($wrong);
        $this->postJson("/api/agencies/invitations/{$invitation->token}/accept")->assertStatus(403);
    }

    public function test_non_admin_cannot_invite(): void
    {
        $owner    = User::factory()->create();
        $agency   = $this->createAgency($owner, 'Y', 'y');
        $stranger = User::factory()->create();

        Sanctum::actingAs($stranger);
        $this->postJson("/api/agencies/{$agency->id}/invitations", [
            'email' => 'someone@example.com', 'role' => 'freelancer',
        ])->assertStatus(403);
    }

    public function test_owner_can_transfer_ownership_to_existing_member(): void
    {
        $owner  = User::factory()->create();
        $agency = $this->createAgency($owner, 'Z', 'z');
        $member = User::factory()->create();
        AgencyMember::create(['agency_id' => $agency->id, 'user_id' => $member->id, 'role' => 'admin']);

        Sanctum::actingAs($owner);
        $this->postJson("/api/agencies/{$agency->id}/transfer-ownership", [
            'new_owner_id' => $member->id,
        ])->assertOk();

        $this->assertSame($member->id, (int) $agency->fresh()->owner_id);
        $this->assertSame('owner', AgencyMember::where('agency_id', $agency->id)->where('user_id', $member->id)->value('role'));
        $this->assertSame('admin', AgencyMember::where('agency_id', $agency->id)->where('user_id', $owner->id)->value('role'));
    }

    public function test_cannot_transfer_to_non_member(): void
    {
        $owner    = User::factory()->create();
        $agency   = $this->createAgency($owner, 'A', 'a-test');
        $stranger = User::factory()->create();

        Sanctum::actingAs($owner);
        $this->postJson("/api/agencies/{$agency->id}/transfer-ownership", [
            'new_owner_id' => $stranger->id,
        ])->assertStatus(422);
    }

    public function test_cannot_remove_owner(): void
    {
        $owner  = User::factory()->create();
        $agency = $this->createAgency($owner, 'B', 'b-test');
        Sanctum::actingAs($owner);
        $this->deleteJson("/api/agencies/{$agency->id}/members/{$owner->id}")->assertStatus(422);
    }

    public function test_decline_invitation_marks_declined(): void
    {
        $owner   = User::factory()->create();
        $agency  = $this->createAgency($owner, 'C', 'c-test');
        $invitee = User::factory()->create(['email' => 'd@example.com']);
        Sanctum::actingAs($owner);
        $this->postJson("/api/agencies/{$agency->id}/invitations", [
            'email' => 'd@example.com', 'role' => 'freelancer',
        ])->assertStatus(201);
        $invitation = AgencyInvitation::where('email', 'd@example.com')->first();

        Sanctum::actingAs($invitee);
        $this->postJson("/api/agencies/invitations/{$invitation->token}/decline")->assertOk();
        $this->assertSame('declined', $invitation->fresh()->status);
    }

    private function createAgency(User $owner, string $name, string $slug): Agency
    {
        $a = Agency::create(['owner_id' => $owner->id, 'name' => $name, 'slug' => $slug]);
        AgencyMember::create(['agency_id' => $a->id, 'user_id' => $owner->id, 'role' => 'owner']);
        return $a;
    }
}
