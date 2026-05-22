<?php

namespace App\Http\Controllers\API\Chat;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
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
                    ] : null,
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

        if (!$conversation->participants->contains($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with('sender')
            ->orderBy('created_at', 'asc')
            ->paginate(50);

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        // Map body → content for frontend
        $messages->getCollection()->transform(function ($msg) {
            $msg->content = $msg->body;
            return $msg;
        });

        return response()->json(['data' => $messages]);
    }

    public function sendMessage(Request $request, $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);

        if (!$conversation->participants->contains($request->user()->id)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

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
        $message->content = $message->body;

        return response()->json(['data' => $message], 201);
    }

    public function startConversation(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
        ]);
        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $me    = $request->user()->id;
        $other = (int) $request->user_id;

        // Check if a direct conversation already exists
        $existing = Conversation::where('type', 'direct')
            ->whereHas('participants', fn($q) => $q->where('user_id', $me))
            ->whereHas('participants', fn($q) => $q->where('user_id', $other))
            ->first();

        if ($existing) {
            return response()->json(['data' => $existing]);
        }

        $conversation = Conversation::create(['type' => 'direct']);
        $conversation->participants()->attach([$me, $other]);

        return response()->json(['data' => $conversation], 201);
    }
}
