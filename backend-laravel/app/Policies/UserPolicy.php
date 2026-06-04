<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /** Everyone can see public profiles; the user themselves can see private data. */
    public function view(?User $actor, User $target): bool
    {
        if ($target->role === 'freelancer') return true;
        if (! $actor) return false;
        return $actor->role === 'admin' || (int) $actor->id === (int) $target->id;
    }

    public function update(User $actor, User $target): bool
    {
        return (int) $actor->id === (int) $target->id;
    }

    public function ban(User $actor, User $target): bool
    {
        if ($actor->role !== 'admin') return false;
        if ((int) $actor->id === (int) $target->id) return false;     // can't self-ban
        if ($target->role === 'admin') return false;                  // can't ban admins
        return true;
    }

    public function verify(User $actor, User $target): bool
    {
        return $actor->role === 'admin' && (int) $actor->id !== (int) $target->id;
    }

    public function impersonate(User $actor, User $target): bool
    {
        return $actor->role === 'admin'
            && $target->role !== 'admin'
            && (int) $actor->id !== (int) $target->id;
    }
}
