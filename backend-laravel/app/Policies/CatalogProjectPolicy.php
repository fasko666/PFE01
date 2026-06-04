<?php

namespace App\Policies;

use App\Models\CatalogProject;
use App\Models\User;

class CatalogProjectPolicy
{
    /** Published projects are public; the seller + admin can see drafts. */
    public function view(?User $user, CatalogProject $project): bool
    {
        if ($project->status === 'published') return true;
        if (! $user) return false;
        return $user->role === 'admin' || (int) $project->seller_id === (int) $user->id;
    }

    public function create(User $user): bool { return $user->role === 'freelancer'; }

    public function update(User $user, CatalogProject $project): bool
    {
        return $user->role === 'admin' || (int) $project->seller_id === (int) $user->id;
    }

    public function delete(User $user, CatalogProject $project): bool
    {
        return $user->role === 'admin' || (int) $project->seller_id === (int) $user->id;
    }

    public function moderate(User $user, CatalogProject $project): bool
    {
        return $user->role === 'admin';
    }
}
