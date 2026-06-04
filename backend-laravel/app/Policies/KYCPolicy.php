<?php

namespace App\Policies;

use App\Models\IdentityVerification;
use App\Models\User;

class KYCPolicy
{
    /** Owner or admin can view. */
    public function view(User $user, IdentityVerification $kyc): bool
    {
        return $user->role === 'admin' || (int) $kyc->user_id === (int) $user->id;
    }

    public function submit(User $user): bool
    {
        return $user->id && $user->is_active;
    }

    public function approve(User $user, IdentityVerification $kyc): bool
    {
        return $user->role === 'admin' && $kyc->status === 'pending';
    }

    public function reject(User $user, IdentityVerification $kyc): bool
    {
        return $user->role === 'admin' && $kyc->status === 'pending';
    }
}
