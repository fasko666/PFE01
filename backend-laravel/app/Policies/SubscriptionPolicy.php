<?php

namespace App\Policies;

use App\Models\Subscription;
use App\Models\User;

class SubscriptionPolicy
{
    public function view(User $user, Subscription $s): bool
    {
        return $user->role === 'admin' || (int) $s->user_id === (int) $user->id;
    }

    public function update(User $user, Subscription $s): bool
    {
        return (int) $s->user_id === (int) $user->id;
    }

    public function cancel(User $user, Subscription $s): bool
    {
        return (int) $s->user_id === (int) $user->id;
    }
}
