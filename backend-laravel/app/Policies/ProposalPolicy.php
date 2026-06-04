<?php

namespace App\Policies;

use App\Models\JobPosting;
use App\Models\Proposal;
use App\Models\User;

class ProposalPolicy
{
    /** Only the freelancer who submitted, the job's client, or an admin can view. */
    public function view(User $user, Proposal $proposal): bool
    {
        return $user->role === 'admin'
            || (int) $proposal->freelancer_id === (int) $user->id
            || (int) $proposal->job?->client_id === (int) $user->id;
    }

    /** Only freelancers can create proposals. */
    public function create(User $user, JobPosting $job): bool
    {
        if ($user->role !== 'freelancer') return false;
        if ($job->visibility !== 'public') return false;
        if ($job->status !== 'open') return false;
        return true;
    }

    /** Owner can withdraw their own proposal while pending. */
    public function withdraw(User $user, Proposal $proposal): bool
    {
        return (int) $proposal->freelancer_id === (int) $user->id
            && in_array($proposal->status, ['pending', 'shortlisted'], true);
    }

    /** Only the job's client (or admin) can accept/reject. */
    public function decide(User $user, Proposal $proposal): bool
    {
        return $user->role === 'admin'
            || (int) $proposal->job?->client_id === (int) $user->id;
    }
}
