<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Withdrawal;

class WithdrawalPolicy
{
    public function view(User $user, Withdrawal $w): bool
    {
        return $user->role === 'admin' || (int) $w->user_id === (int) $user->id;
    }

    public function request(User $user): bool
    {
        return $user->id && in_array($user->role, ['freelancer', 'client'], true);
    }

    /** Only the requester can cancel their own withdrawal — and only while pending. */
    public function cancel(User $user, Withdrawal $w): bool
    {
        return (int) $w->user_id === (int) $user->id && $w->status === 'pending';
    }

    public function approve(User $user, Withdrawal $w): bool
    {
        return $user->role === 'admin' && $w->status === 'pending';
    }

    public function reject(User $user, Withdrawal $w): bool
    {
        return $user->role === 'admin' && $w->status === 'pending';
    }
}
