<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conv): bool
    {
        return $user->role === 'admin' || $conv->participants->contains($user->id);
    }

    public function send(User $user, Conversation $conv): bool
    {
        return $conv->participants->contains($user->id);
    }

    public function leave(User $user, Conversation $conv): bool
    {
        return $conv->participants->contains($user->id);
    }
}
