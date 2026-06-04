<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;

class MessagePolicy
{
    public function view(User $user, Message $msg): bool
    {
        return $user->role === 'admin'
            || $msg->conversation?->participants->contains($user->id);
    }

    /** Sender can edit within a 15-minute window. */
    public function update(User $user, Message $msg): bool
    {
        return (int) $msg->sender_id === (int) $user->id
            && $msg->created_at->diffInMinutes(now()) <= 15;
    }

    /** Sender can soft-delete; admins always can. */
    public function delete(User $user, Message $msg): bool
    {
        return $user->role === 'admin' || (int) $msg->sender_id === (int) $user->id;
    }

    /** Reactions: any participant. */
    public function react(User $user, Message $msg): bool
    {
        return $msg->conversation?->participants->contains($user->id);
    }
}
