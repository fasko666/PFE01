<?php

namespace App\Policies;

use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    /** Reviews are always public unless explicitly set otherwise. */
    public function view(?User $user, Review $review): bool
    {
        return (bool) $review->is_public
            || ($user && ($user->role === 'admin'
                || (int) $review->reviewer_id === (int) $user->id
                || (int) $review->reviewee_id === (int) $user->id));
    }

    public function create(User $user): bool
    {
        return $user->id && in_array($user->role, ['client', 'freelancer'], true);
    }

    public function update(User $user, Review $review): bool
    {
        return (int) $review->reviewer_id === (int) $user->id;
    }

    public function delete(User $user, Review $review): bool
    {
        return $user->role === 'admin' || (int) $review->reviewer_id === (int) $user->id;
    }
}
