<?php

namespace App\Policies;

use App\Models\Agency;
use App\Models\User;

class AgencyPolicy
{
    public function view(?User $user, Agency $agency): bool
    {
        // Agencies are public profiles
        return true;
    }

    public function create(User $user): bool { return (bool) $user->id; }

    public function update(User $user, Agency $agency): bool
    {
        $role = $agency->roleOf($user->id);
        return $role === 'owner' || $role === 'admin';
    }

    public function delete(User $user, Agency $agency): bool
    {
        return (int) $agency->owner_id === (int) $user->id;
    }

    /** Invite / remove / transfer members. */
    public function manageMembers(User $user, Agency $agency): bool
    {
        $role = $agency->roleOf($user->id);
        return $role === 'owner' || $role === 'admin';
    }

    /** Only the current owner can transfer ownership. */
    public function transferOwnership(User $user, Agency $agency): bool
    {
        return (int) $agency->owner_id === (int) $user->id;
    }
}
