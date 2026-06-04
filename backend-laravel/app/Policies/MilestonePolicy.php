<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\Milestone;
use App\Models\User;

/**
 * Centralized authorization for milestone actions.
 *
 *   view    → contract participants + admin
 *   create  → only the contract client
 *   update  → only the contract client AND milestone is not finalized
 *   delete  → only the contract client AND milestone is not in {paid, approved, submitted}
 *   submit  → only the assigned freelancer AND milestone is in {pending, in_progress, rejected}
 *   approve → only the contract client AND milestone is submitted
 *   reject  → only the contract client AND milestone is submitted
 *
 * State-machine validity is asserted in the controller (returns 422). The policy
 * answers only "is this user allowed in principle?" (returns 403).
 */
class MilestonePolicy
{
    public function view(User $user, Milestone $milestone): bool
    {
        $contract = $milestone->contract;
        return $contract && ($user->role === 'admin' || $contract->hasParticipant($user->id));
    }

    public function create(User $user, Contract $contract): bool
    {
        return (int) $contract->client_id === (int) $user->id;
    }

    public function update(User $user, Milestone $milestone): bool
    {
        $contract = $milestone->contract;
        if (! $contract || (int) $contract->client_id !== (int) $user->id) return false;
        return ! in_array($milestone->status, ['paid', 'approved'], true);
    }

    public function delete(User $user, Milestone $milestone): bool
    {
        $contract = $milestone->contract;
        if (! $contract || (int) $contract->client_id !== (int) $user->id) return false;
        return ! in_array($milestone->status, ['paid', 'approved', 'submitted'], true);
    }

    public function submit(User $user, Milestone $milestone): bool
    {
        $contract = $milestone->contract;
        return $contract && (int) $contract->freelancer_id === (int) $user->id;
    }

    public function approve(User $user, Milestone $milestone): bool
    {
        $contract = $milestone->contract;
        return $contract && (int) $contract->client_id === (int) $user->id;
    }

    public function reject(User $user, Milestone $milestone): bool
    {
        $contract = $milestone->contract;
        return $contract && (int) $contract->client_id === (int) $user->id;
    }
}
