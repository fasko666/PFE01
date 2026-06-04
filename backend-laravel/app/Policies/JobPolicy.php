<?php

namespace App\Policies;

use App\Models\JobPosting;
use App\Models\User;

class JobPolicy
{
    /** Anyone can view a public job; the owner + admins always can. */
    public function view(?User $user, JobPosting $job): bool
    {
        if ($job->visibility === 'public') return true;
        if (! $user) return false;
        return $user->role === 'admin' || (int) $job->client_id === (int) $user->id;
    }

    /** Only clients (and admins) can create jobs. */
    public function create(User $user): bool
    {
        return in_array($user->role, ['client', 'admin'], true);
    }

    public function update(User $user, JobPosting $job): bool
    {
        return $user->role === 'admin' || (int) $job->client_id === (int) $user->id;
    }

    public function delete(User $user, JobPosting $job): bool
    {
        return $user->role === 'admin' || (int) $job->client_id === (int) $user->id;
    }

    /** Save/bookmark — any authenticated user. */
    public function save(User $user, JobPosting $job): bool
    {
        return $user->id && $job->visibility === 'public';
    }
}
