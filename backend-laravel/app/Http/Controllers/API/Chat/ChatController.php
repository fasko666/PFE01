<?php

namespace App\Http\Controllers\API\Chat;

use App\Events\ConversationUpdated;
use App\Events\MessageDelivered;
use App\Events\MessageDeleted;
use App\Events\MessageEdited;
use App\Events\MessageReactionToggled;
use App\Events\MessageRead;
use App\Events\MessageSent;
use App\Events\UserTyping;
use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    // ── EXISTING ENDPOINTS — response shape preserved, only broadcasts added ──

    public function conversations(Request $request): JsonResponse
    {
        $conversations = $request->user()->conversations()
            ->with(['participants', 'lastMessage.sender'])
            ->orderBy('last_message_at', 'desc')
            ->get()
            ->map(function ($conv) use ($request) {
                $other = $conv->participants->where('id', '!=', $request->user()->id)->first();
                $unread = $conv->messages()
                    ->where('sender_id', '!=', $request->user()->id)
                    ->where('is_read', false)
                    ->count();
                return [
                    'id'           => $conv->id,
                    'type'         => $conv->type,
                    'title'        => $conv->title ?? ($other ? $other->name : 'Conversation'),
                    'other_user'   => $other ? [
                        'id'         => $other->id,
                        'name'       => $other->name,
                        'avatar_url' => $other->avatar_url,
                        'is_online'  => $other->is_online,
                        'last_seen_at' => optional($other->last_seen_at)->toIso8601String(),
                    ] : null,
                    'participants' => $conv->participants->map(fn ($p) => [
                        'id'         => $p->id,
                        'name'       => $p->name,
                        'avatar_url' => $p->avatar_url,
                        'is_online'  => $p->is_online,
                    ])->values(),
                    'last_message' => $conv->lastMessage ? [
                        'content'    => $conv->lastMessage->body,
                        'type'       => $conv->lastMessage->type,
                        'sender_id'  => $conv->lastMessage->sender_id,
                        'created_at' => $conv->lastMessage->created_at,
                    ] : null,
                    'unread_count' => $unread,
                    'updated_at'   => $conv->last_message_at ?? $conv->updated_at,
                ];
            });

        return response()->json(['data' => $conversations]);
    }

    public function messages(Request $request, $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $this->ensureParticipant($request, $conversation);

        $messages = $conversation->messages()
            ->with(['sender', 'reactions'])
            ->orderBy('created_at', 'desc')   // newest first; frontend reverses for display
            ->paginate(50);

        // Mark messages as read + emit MessageRead so the other side sees ✓✓ live.
        $now = now();
        $affected = $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => $now]);

        if ($affected > 0) {
            broadcast(new MessageRead(
                conversationId: $conversation->id,
                readerId:       $request->user()->id,
                readAt:         $now->toIso8601String(),
            ))->toOthers();

            // Update the SENDER's conversation list (their unread count for their
            // own conversation never changed — this re-syncs after we read).
            $this->pushConversationUpdated($conversation, [$request->user()->id]);
        }

        $messages->getCollection()->transform(function ($msg) {
            $msg->content   = $msg->body;
            $msg->reactions = $msg->reactions->map(fn ($r) => [
                'id'      => $r->id,
                'user_id' => $r->user_id,
                'emoji'   => $r->emoji,
            ])->values();
            return $msg;
        });

        return response()->json(['data' => $messages]);
    }

    public function sendMessage(Request $request, $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $this->ensureParticipant($request, $conversation);

        $validator = Validator::make($request->all(), [
            'content'     => 'required|string|max:5000',
            'type'        => 'in:text,file,image',
            'reply_to_id' => 'nullable|exists:messages,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $request->user()->id,
            'body'            => $request->content,
            'type'            => $request->type ?? 'text',
            'reply_to_id'     => $request->reply_to_id,
        ]);

        $conversation->update(['last_message_at' => now()]);

        $message->load('sender');
        $message->content   = $message->body;
        $message->reactions = [];

        broadcast(new MessageSent($message))->toOthers();
        $this->pushConversationUpdated($conversation);

        return response()->json(['data' => $message], 201);
    }

    public function startConversation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $me    = $request->user()->id;
        $other = (int) $request->user_id;

        $existing = Conversation::where('type', 'direct')
            ->whereHas('participants', fn ($q) => $q->where('user_id', $me))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $other))
            ->first();

        if ($existing) {
            return response()->json(['data' => $existing]);
        }

        $conversation = Conversation::create(['type' => 'direct']);
        $conversation->participants()->attach([$me, $other]);

        return response()->json(['data' => $conversation], 201);
    }

    // ── NEW ENDPOINTS ────────────────────────────────────────────────────────

    /** POST /chat/conversations/{id}/typing  body: { is_typing: bool } */
    public function typing(Request $request, $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $this->ensureParticipant($request, $conversation);

        $isTyping = (bool) $request->boolean('is_typing', true);

        // Use broadcast()->toOthers() so the typing client doesn't echo back to
        // itself (and we keep this off the queue with ShouldBroadcastNow).
        broadcast(new UserTyping(
            conversationId: $conversation->id,
            userId:         $request->user()->id,
            isTyping:       $isTyping,
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /** POST /chat/conversations/{id}/read — explicit "mark read" for the unread badge */
    public function markRead(Request $request, $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $this->ensureParticipant($request, $conversation);

        $now = now();
        $affected = $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => $now]);

        if ($affected > 0) {
            broadcast(new MessageRead(
                conversationId: $conversation->id,
                readerId:       $request->user()->id,
                readAt:         $now->toIso8601String(),
            ))->toOthers();

            $this->pushConversationUpdated($conversation, [$request->user()->id]);
        }

        return response()->json(['success' => true, 'affected' => $affected]);
    }

    /** POST /chat/messages/{id}/delivered — recipient ACK after Echo receives MessageSent */
    public function markDelivered(Request $request, $messageId): JsonResponse
    {
        $message = Message::with('conversation')->findOrFail($messageId);
        $this->ensureParticipant($request, $message->conversation);

        // Sender doesn't ack their own message; ignore quietly.
        if ((int) $message->sender_id === (int) $request->user()->id) {
            return response()->json(['success' => true, 'skipped' => true]);
        }

        if (! $message->delivered_at) {
            $message->update(['delivered_at' => now()]);
        }

        broadcast(new MessageDelivered(
            conversationId: $message->conversation_id,
            messageId:      $message->id,
            recipientId:    $request->user()->id,
            deliveredAt:    optional($message->delivered_at)->toIso8601String() ?? now()->toIso8601String(),
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /** PUT /chat/messages/{id}  body: { content: string } */
    public function editMessage(Request $request, $messageId): JsonResponse
    {
        $message = Message::findOrFail($messageId);

        if ((int) $message->sender_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'You can only edit your own messages'], 403);
        }

        // 15-minute edit window — Slack/Discord/WhatsApp parity
        if ($message->created_at->diffInMinutes(now()) > 15) {
            return response()->json(['message' => 'Edit window expired (15 min)'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|max:5000',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $message->update([
            'body'      => $request->content,
            'edited_at' => now(),
        ]);

        broadcast(new MessageEdited($message))->toOthers();

        $message->content = $message->body;
        return response()->json(['data' => $message]);
    }

    /** DELETE /chat/messages/{id} — soft delete (allows audit + ban evidence) */
    public function deleteMessage(Request $request, $messageId): JsonResponse
    {
        $message = Message::findOrFail($messageId);

        // Owner can always delete; an admin can delete anyone's
        $isOwner = (int) $message->sender_id === (int) $request->user()->id;
        $isAdmin = method_exists($request->user(), 'isAdmin') && $request->user()->isAdmin();

        if (! $isOwner && ! $isAdmin) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $convId = $message->conversation_id;
        $message->delete(); // soft delete

        broadcast(new MessageDeleted(
            conversationId: $convId,
            messageId:      (int) $messageId,
            deletedBy:      (int) $request->user()->id,
        ))->toOthers();

        return response()->json(['success' => true]);
    }

    /** POST /chat/messages/{id}/reactions  body: { emoji: string }  → toggle */
    public function react(Request $request, $messageId): JsonResponse
    {
        $message = Message::with('conversation')->findOrFail($messageId);
        $this->ensureParticipant($request, $message->conversation);

        $validator = Validator::make($request->all(), [
            'emoji' => 'required|string|max:16',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $emoji = $request->input('emoji');

        // Atomic toggle: if it exists, remove; else insert
        return DB::transaction(function () use ($message, $request, $emoji) {
            $existing = MessageReaction::where([
                'message_id' => $message->id,
                'user_id'    => $request->user()->id,
                'emoji'      => $emoji,
            ])->lockForUpdate()->first();

            if ($existing) {
                $existing->delete();
                $action = 'removed';
            } else {
                MessageReaction::create([
                    'message_id' => $message->id,
                    'user_id'    => $request->user()->id,
                    'emoji'      => $emoji,
                ]);
                $action = 'added';
            }

            broadcast(new MessageReactionToggled(
                conversationId: $message->conversation_id,
                messageId:      $message->id,
                userId:         $request->user()->id,
                emoji:          $emoji,
                action:         $action,
            ))->toOthers();

            return response()->json(['success' => true, 'action' => $action]);
        });
    }

    /**
     * POST /chat/conversations/{id}/attachment
     *   multipart: file (required), type ∈ file|image|voice (default: auto from MIME)
     *   Stores the file on the public disk and creates a message whose
     *   `attachments` JSON points to it. Broadcasts MessageSent like a normal send.
     */
    public function sendAttachment(Request $request, $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);
        $this->ensureParticipant($request, $conversation);

        $request->validate([
            'file' => 'required|file|max:25600',          // 25 MB
            'type' => 'nullable|in:file,image,voice',
            'body' => 'nullable|string|max:1000',
        ]);
        $f = $request->file('file');
        $stored = $f->store("chat/{$conversation->id}", 'public');

        $type = $request->input('type')
            ?? (str_starts_with($f->getClientMimeType(), 'image/') ? 'image'
              : (str_starts_with($f->getClientMimeType(), 'audio/') ? 'voice' : 'file'));

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $request->user()->id,
            'body'            => $request->input('body', ''),
            'type'            => $type,
            'attachments'     => [[
                'path'      => $stored,
                'url'       => \Illuminate\Support\Facades\Storage::disk('public')->url($stored),
                'name'      => $f->getClientOriginalName(),
                'mime'      => $f->getClientMimeType(),
                'size'      => $f->getSize(),
            ]],
        ]);

        $conversation->update(['last_message_at' => now()]);
        $message->load('sender');
        $message->content = $message->body;
        $message->reactions = [];

        broadcast(new MessageSent($message))->toOthers();
        $this->pushConversationUpdated($conversation);

        return response()->json(['data' => $message], 201);
    }

    /** GET /chat/conversations/search?q=... — server-side conversation search */
    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));
        if ($q === '') {
            return response()->json(['data' => []]);
        }

        $userId = $request->user()->id;
        $needle = '%'.str_replace(['%', '_'], ['\\%', '\\_'], $q).'%';

        $conversationIds = DB::table('conversation_participants')
            ->where('user_id', $userId)
            ->pluck('conversation_id');

        // Hits in message bodies + hits in other participants' names
        $msgHits = Message::query()
            ->whereIn('conversation_id', $conversationIds)
            ->where('body', 'like', $needle)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get(['id', 'conversation_id', 'body', 'sender_id', 'created_at']);

        $nameHits = DB::table('conversations as c')
            ->join('conversation_participants as cp', 'cp.conversation_id', '=', 'c.id')
            ->join('users as u', 'u.id', '=', 'cp.user_id')
            ->whereIn('c.id', $conversationIds)
            ->where('u.id', '!=', $userId)
            ->where('u.name', 'like', $needle)
            ->select('c.id as conversation_id', 'u.name as match')
            ->limit(50)
            ->get();

        return response()->json([
            'data' => [
                'message_hits'      => $msgHits,
                'conversation_hits' => $nameHits,
            ],
        ]);
    }

    // ── HELPERS ──────────────────────────────────────────────────────────────

    private function ensureParticipant(Request $request, Conversation $conv): void
    {
        if (! $conv->participants->contains($request->user()->id)) {
            abort(response()->json(['message' => 'Unauthorized'], 403));
        }
    }

    /**
     * Tell every participant's user channel that this conversation changed,
     * so their conversation list updates without polling.
     *
     * @param  array<int>  $skipUserIds  participants to skip (e.g. the actor)
     */
    private function pushConversationUpdated(Conversation $conv, array $skipUserIds = []): void
    {
        $conv->loadMissing('participants', 'lastMessage');

        $last = $conv->lastMessage ? [
            'content'    => $conv->lastMessage->body,
            'type'       => $conv->lastMessage->type,
            'sender_id'  => $conv->lastMessage->sender_id,
            'created_at' => $conv->lastMessage->created_at,
        ] : null;

        foreach ($conv->participants as $p) {
            if (in_array($p->id, $skipUserIds, true)) {
                continue;
            }
            $unread = $conv->messages()
                ->where('sender_id', '!=', $p->id)
                ->where('is_read', false)
                ->count();

            broadcast(new ConversationUpdated(
                userId:         $p->id,
                conversationId: $conv->id,
                lastMessage:    $last,
                unreadCount:    $unread,
            ));
        }
    }
}
