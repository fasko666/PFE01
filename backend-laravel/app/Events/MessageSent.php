<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message)
    {
    }

    /**
     * Broadcast on a private channel scoped to the conversation. Only users
     * whose membership is confirmed in routes/channels.php can subscribe.
     */
    public function broadcastOn(): array
    {
        return [new PrivateChannel('conversation.'.$this->message->conversation_id)];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    /**
     * Slim, deterministic payload. We never serialize the full Eloquent model
     * — that leaks fields and breaks Echo clients when the schema changes.
     */
    public function broadcastWith(): array
    {
        $m = $this->message;

        return [
            'id'              => $m->id,
            'conversation_id' => $m->conversation_id,
            'sender_id'       => $m->sender_id,
            'body'            => $m->body,
            'type'            => $m->type,
            'attachments'     => $m->attachments,
            'metadata'        => $m->metadata,
            'reply_to_id'     => $m->reply_to_id,
            'is_read'         => (bool) $m->is_read,
            'read_at'         => optional($m->read_at)->toIso8601String(),
            'created_at'      => optional($m->created_at)->toIso8601String(),
        ];
    }
}
