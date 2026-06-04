<?php

namespace App\Policies;

use App\Models\Contract;
use App\Models\User;

/**
 * Centralized authorization for contract actions. Used via $request->user()->can('xxx', $contract)
 * inside ContractController. Tests cover the matrix of abilities × roles in ContractPolicyTest.
 *
 * State-machine transition validity is NOT enforced here — that lives in the controller and
 * uses Contract::canTransitionTo() so we can return a clean 422 with a message distinct from 403.
 */
class ContractPolicy
{
    /** Any participant or admin can view. */
    public function view(User $user, Contract $contract): bool
    {
        return $user->role === 'admin' || $contract->hasParticipant($user->id);
    }

    /** Only the client can complete a contract. */
    public function complete(User $user, Contract $contract): bool
    {
        return (int) $contract->client_id === (int) $user->id;
    }

    /** Either participant can cancel. Admin can force-cancel via the same endpoint. */
    public function cancel(User $user, Contract $contract): bool
    {
        return $user->role === 'admin' || $contract->hasParticipant($user->id);
    }

    /** Either participant can open a dispute. */
    public function dispute(User $user, Contract $contract): bool
    {
        return $contract->hasParticipant($user->id);
    }

    /** Only admins can resolve a dispute. */
    public function resolveDispute(User $user, Contract $contract): bool
    {
        return $user->role === 'admin';
    }
}
