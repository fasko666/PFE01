<?php

namespace Tests\Feature\Chat;

use App\Events\ConversationUpdated;
use App\Events\MessageDeleted;
use App\Events\MessageEdited;
use App\Events\MessageReactionToggled;
use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReaction;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChatRealtimeTest extends TestCase
{
    use RefreshDatabase;

    private User $alice;
    private User $bob;
    private Conversation $conv;

    protected function setUp(): void
    {
        parent::setUp();
        $this->alice = User::factory()->create();
        $this->bob   = User::factory()->create();
        $this->conv  = Conversation::create(['type' => 'direct']);
        $this->conv->participants()->attach([$this->alice->id, $this->bob->id]);
    }

    public function test_existing_send_endpoint_still_returns_201_with_data(): void
    {
        Event::fake([MessageSent::class, ConversationUpdated::class]);
        Sanctum::actingAs($this->alice);

        $res = $this->postJson("/api/chat/conversations/{$this->conv->id}/send", [
            'content' => 'hello',
            'type'    => 'text',
        ]);

        $res->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'conversation_id', 'sender_id', 'body']]);

        $this->assertDatabaseHas('messages', ['conversation_id' => $this->conv->id, 'body' => 'hello']);
        Event::assertDispatched(MessageSent::class);
        Event::assertDispatched(ConversationUpdated::class); // bob's list updates
    }

    public function test_non_participant_cannot_send(): void
    {
        $eve = User::factory()->create();
        Sanctum::actingAs($eve);

        $this->postJson("/api/chat/conversations/{$this->conv->id}/send", ['content' => 'spam'])
            ->assertStatus(403);
    }

    public function test_typing_emits_user_typing_event(): void
    {
        Event::fake([UserTyping::class]);
        Sanctum::actingAs($this->alice);

        $this->postJson("/api/chat/conversations/{$this->conv->id}/typing", ['is_typing' => true])
            ->assertOk();

        Event::assertDispatched(UserTyping::class, fn ($e) => $e->userId === $this->alice->id && $e->isTyping);
    }

    public function test_mark_read_updates_db_and_emits_event(): void
    {
        Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->bob->id,
            'body'            => 'hi alice',
            'type'            => 'text',
        ]);

        Event::fake([MessageRead::class]);
        Sanctum::actingAs($this->alice);

        $this->postJson("/api/chat/conversations/{$this->conv->id}/read")
            ->assertOk()
            ->assertJson(['affected' => 1]);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->bob->id,
            'is_read'         => 1,
        ]);
        Event::assertDispatched(MessageRead::class);
    }

    public function test_owner_can_edit_within_window_and_event_fires(): void
    {
        $msg = Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->alice->id,
            'body'            => 'original',
            'type'            => 'text',
        ]);

        Event::fake([MessageEdited::class]);
        Sanctum::actingAs($this->alice);

        $this->putJson("/api/chat/messages/{$msg->id}", ['content' => 'edited!'])
            ->assertOk();

        $this->assertDatabaseHas('messages', ['id' => $msg->id, 'body' => 'edited!']);
        $this->assertNotNull($msg->fresh()->edited_at);
        Event::assertDispatched(MessageEdited::class);
    }

    public function test_non_owner_cannot_edit(): void
    {
        $msg = Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->alice->id,
            'body'            => 'original',
            'type'            => 'text',
        ]);
        Sanctum::actingAs($this->bob);
        $this->putJson("/api/chat/messages/{$msg->id}", ['content' => 'hijack'])
            ->assertStatus(403);
    }

    public function test_owner_can_soft_delete_and_event_fires(): void
    {
        $msg = Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->alice->id,
            'body'            => 'oops',
            'type'            => 'text',
        ]);

        Event::fake([MessageDeleted::class]);
        Sanctum::actingAs($this->alice);

        $this->deleteJson("/api/chat/messages/{$msg->id}")->assertOk();
        $this->assertSoftDeleted('messages', ['id' => $msg->id]);
        Event::assertDispatched(MessageDeleted::class);
    }

    public function test_reaction_toggles_and_emits_action(): void
    {
        $msg = Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->bob->id,
            'body'            => 'react to me',
            'type'            => 'text',
        ]);

        Event::fake([MessageReactionToggled::class]);
        Sanctum::actingAs($this->alice);

        // first call → added
        $this->postJson("/api/chat/messages/{$msg->id}/reactions", ['emoji' => '👍'])
            ->assertOk()->assertJson(['action' => 'added']);
        $this->assertDatabaseHas('message_reactions', [
            'message_id' => $msg->id, 'user_id' => $this->alice->id, 'emoji' => '👍',
        ]);

        // second call → removed (toggle)
        $this->postJson("/api/chat/messages/{$msg->id}/reactions", ['emoji' => '👍'])
            ->assertOk()->assertJson(['action' => 'removed']);
        $this->assertDatabaseMissing('message_reactions', [
            'message_id' => $msg->id, 'user_id' => $this->alice->id, 'emoji' => '👍',
        ]);

        Event::assertDispatchedTimes(MessageReactionToggled::class, 2);
    }

    public function test_reaction_unique_constraint_prevents_duplicate_inserts(): void
    {
        $msg = Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->bob->id,
            'body'            => 'x',
            'type'            => 'text',
        ]);
        MessageReaction::create(['message_id' => $msg->id, 'user_id' => $this->alice->id, 'emoji' => '❤️']);

        $this->expectException(\Illuminate\Database\QueryException::class);
        MessageReaction::create(['message_id' => $msg->id, 'user_id' => $this->alice->id, 'emoji' => '❤️']);
    }

    public function test_conversations_endpoint_returns_unread_count(): void
    {
        Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->bob->id,
            'body'            => 'unread 1',
            'type'            => 'text',
        ]);
        Message::create([
            'conversation_id' => $this->conv->id,
            'sender_id'       => $this->bob->id,
            'body'            => 'unread 2',
            'type'            => 'text',
        ]);

        Sanctum::actingAs($this->alice);
        $this->getJson('/api/chat/conversations')
            ->assertOk()
            ->assertJsonPath('data.0.unread_count', 2);
    }
}
