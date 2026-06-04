<?php

namespace Tests\Unit\Events;

use App\Events\ConversationUpdated;
use App\Events\MessageDeleted;
use App\Events\MessageDelivered;
use App\Events\MessageEdited;
use App\Events\MessageReactionToggled;
use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Models\Message;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Tests\TestCase;

class ChatEventsTest extends TestCase
{
    public function test_message_sent_broadcasts_on_private_conversation_channel(): void
    {
        $msg = new Message([
            'conversation_id' => 7,
            'sender_id'       => 42,
            'body'            => 'hi',
            'type'            => 'text',
        ]);
        $msg->id = 999;

        $event = new MessageSent($msg);
        $channels = $event->broadcastOn();

        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-conversation.7', $channels[0]->name);
        $this->assertSame('message.sent', $event->broadcastAs());
        $this->assertInstanceOf(ShouldBroadcast::class, $event);

        $payload = $event->broadcastWith();
        $this->assertSame(999,  $payload['id']);
        $this->assertSame(7,    $payload['conversation_id']);
        $this->assertSame(42,   $payload['sender_id']);
        $this->assertSame('hi', $payload['body']);
    }

    public function test_user_typing_is_broadcast_now(): void
    {
        $event = new UserTyping(7, 42, true);
        $this->assertInstanceOf(ShouldBroadcastNow::class, $event);
        $this->assertSame('user.typing', $event->broadcastAs());
        $this->assertSame('private-conversation.7', $event->broadcastOn()[0]->name);
        $this->assertTrue($event->broadcastWith()['is_typing']);
    }

    public function test_message_read_payload(): void
    {
        $event = new MessageRead(7, 42, '2026-01-01T00:00:00Z');
        $this->assertSame('message.read', $event->broadcastAs());
        $this->assertSame(42, $event->broadcastWith()['reader_id']);
    }

    public function test_message_delivered_is_broadcast_now(): void
    {
        $event = new MessageDelivered(7, 999, 42, '2026-01-01T00:00:00Z');
        $this->assertInstanceOf(ShouldBroadcastNow::class, $event);
        $this->assertSame('message.delivered', $event->broadcastAs());
        $this->assertSame(999, $event->broadcastWith()['message_id']);
    }

    public function test_message_edited_includes_edited_at(): void
    {
        $msg = new Message(['body' => 'updated']);
        $msg->id = 1;
        $msg->conversation_id = 7;
        $msg->edited_at = now();

        $event = new MessageEdited($msg);
        $this->assertSame('message.edited', $event->broadcastAs());
        $this->assertSame('updated', $event->broadcastWith()['body']);
        $this->assertNotNull($event->broadcastWith()['edited_at']);
    }

    public function test_message_deleted_payload(): void
    {
        $event = new MessageDeleted(7, 999, 42);
        $this->assertSame('message.deleted', $event->broadcastAs());
        $this->assertSame(999, $event->broadcastWith()['message_id']);
    }

    public function test_reaction_toggled_payload(): void
    {
        $event = new MessageReactionToggled(7, 999, 42, '👍', 'added');
        $this->assertSame('message.reaction', $event->broadcastAs());
        $this->assertSame('added', $event->broadcastWith()['action']);
        $this->assertSame('👍',    $event->broadcastWith()['emoji']);
    }

    public function test_conversation_updated_routes_to_user_channel(): void
    {
        $event = new ConversationUpdated(42, 7, ['content' => 'hi'], 3);
        $this->assertSame('private-user.42', $event->broadcastOn()[0]->name);
        $this->assertSame(3, $event->broadcastWith()['unread_count']);
    }
}
