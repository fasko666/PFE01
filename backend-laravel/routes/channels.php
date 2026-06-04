<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/**
 * Per-user private channel — used for user-targeted events that should follow
 * the user regardless of which conversation is open (conversation list updates,
 * notification badge updates, contract events…).
 */
Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/** Default Laravel notification channel — required by Notifiable broadcasts. */
Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

/**
 * Conversation channel — gates real-time chat events (MessageSent, UserTyping,
 * MessageRead, MessageEdited, MessageDeleted, MessageReactionToggled,
 * MessageDelivered) so ONLY confirmed participants can subscribe.
 */
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return Conversation::query()
        ->whereKey((int) $conversationId)
        ->whereHas('participants', fn ($q) => $q->whereKey($user->id))
        ->exists();
});

/**
 * Global presence channel — every authenticated user joins on app load. The
 * "members" list is the canonical online roster; we use it to update the green
 * dot in the conversation list in real time without polling.
 *
 * Returning an array (not a boolean) is the Pusher protocol's way of saying
 * "yes, here is my public profile to broadcast to other members."
 */
Broadcast::channel('presence.online', function (User $user) {
    return [
        'id'         => $user->id,
        'name'       => $user->name,
        'avatar_url' => $user->avatar_url,
    ];
});
