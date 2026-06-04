<?php

namespace App\Policies;

use App\Models\Portfolio;
use App\Models\User;

class PortfolioPolicy
{
    /** Portfolios are public by design. */
    public function view(?User $user, Portfolio $p): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->role === 'freelancer';
    }

    public function update(User $user, Portfolio $p): bool
    {
        return (int) $p->user_id === (int) $user->id;
    }

    public function delete(User $user, Portfolio $p): bool
    {
        return $user->role === 'admin' || (int) $p->user_id === (int) $user->id;
    }
}
