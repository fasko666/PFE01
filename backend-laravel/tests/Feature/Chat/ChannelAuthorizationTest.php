<?php

namespace Tests\Feature\Chat;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Broadcast;
use Laravel\Sanctum\Sanctum;
use ReflectionClass;
use Tests\TestCase;

/**
 * Verifies routes/channels.php authorization callbacks.
 *
 * The /broadcasting/auth HTTP route requires a real broadcaster (Pusher/Reverb)
 * to invoke callbacks — in the test env BROADCAST_CONNECTION=null is a no-op
 * that returns 200. So we extract the registered callbacks via reflection and
 * call them directly with synthetic users. This is the canonical way to unit-
 * test channel auth in Laravel.
 *
 * The HTTP middleware/auth wiring of /broadcasting/auth itself is exercised by
 * test_unauthenticated_request_is_rejected below.
 */
class ChannelAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Pull a registered Broadcast::channel callback by pattern.
     */
    private function getChannelCallback(string $pattern): \Closure
    {
        $broadcaster = Broadcast::getFacadeRoot()->driver();
        $ref = new ReflectionClass($broadcaster);

        // Walk up to the abstract Broadcaster which owns $channels.
        while ($ref && ! $ref->hasProperty('channels')) {
            $ref = $ref->getParentClass();
        }
        $prop = $ref->getProperty('channels');
        $prop->setAccessible(true);
        $channels = $prop->getValue($broadcaster);

        if (! isset($channels[$pattern])) {
            throw new \RuntimeException("Channel pattern not registered: {$pattern}");
        }

        return $channels[$pattern] instanceof \Closure
            ? $channels[$pattern]
            : \Closure::fromCallable($channels[$pattern]);
    }

    public function test_participant_can_authorize_private_conversation_channel(): void
    {
        $alice = User::factory()->create();
        $bob   = User::factory()->create();
        $conv  = Conversation::create(['type' => 'direct']);
        $conv->participants()->attach([$alice->id, $bob->id]);

        $callback = $this->getChannelCallback('conversation.{conversationId}');
        $this->assertTrue((bool) $callback($alice, (string) $conv->id));
        $this->assertTrue((bool) $callback($bob, (string) $conv->id));
    }

    public function test_non_participant_is_denied_on_private_conversation_channel(): void
    {
        $alice = User::factory()->create();
        $bob   = User::factory()->create();
        $eve   = User::factory()->create();
        $conv  = Conversation::create(['type' => 'direct']);
        $conv->participants()->attach([$alice->id, $bob->id]);

        $callback = $this->getChannelCallback('conversation.{conversationId}');
        $this->assertFalse((bool) $callback($eve, (string) $conv->id));
    }

    public function test_user_channel_only_authorizes_owner(): void
    {
        $alice = User::factory()->create();
        $bob   = User::factory()->create();

        $callback = $this->getChannelCallback('user.{id}');
        $this->assertTrue((bool)  $callback($alice, (string) $alice->id));
        $this->assertFalse((bool) $callback($alice, (string) $bob->id));
    }

    public function test_presence_channel_returns_user_payload(): void
    {
        $alice = User::factory()->create();

        $callback = $this->getChannelCallback('presence.online');
        $payload = $callback($alice);

        $this->assertIsArray($payload);
        $this->assertSame($alice->id,   $payload['id']);
        $this->assertSame($alice->name, $payload['name']);
        $this->assertArrayHasKey('avatar_url', $payload);
    }

    public function test_app_models_user_channel_only_authorizes_owner(): void
    {
        $alice = User::factory()->create();
        $bob   = User::factory()->create();

        $callback = $this->getChannelCallback('App.Models.User.{id}');
        $this->assertTrue((bool)  $callback($alice, (string) $alice->id));
        $this->assertFalse((bool) $callback($alice, (string) $bob->id));
    }

    public function test_unauthenticated_request_to_broadcasting_auth_is_rejected(): void
    {
        // This still verifies that the /broadcasting/auth route is bound to
        // auth:sanctum (as wired in bootstrap/app.php via withBroadcasting).
        $this->postJson('/broadcasting/auth', [
            'socket_id'    => '12345.67890',
            'channel_name' => 'private-user.1',
        ])->assertStatus(401);
    }

    public function test_authenticated_request_to_broadcasting_auth_passes_middleware(): void
    {
        $alice = User::factory()->create();
        Sanctum::actingAs($alice);

        // 200 (NullBroadcaster no-op) means the auth:sanctum middleware allowed
        // the request — that's what this test is checking.
        $this->postJson('/broadcasting/auth', [
            'socket_id'    => '12345.67890',
            'channel_name' => "private-user.{$alice->id}",
        ])->assertOk();
    }
}
