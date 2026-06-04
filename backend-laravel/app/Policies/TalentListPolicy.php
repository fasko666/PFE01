<?php

namespace App\Policies;

use App\Models\TalentList;
use App\Models\User;

class TalentListPolicy
{
    public function view(User $user, TalentList $list): bool
    {
        return $user->role === 'admin' || (int) $list->user_id === (int) $user->id;
    }

    public function create(User $user): bool
    {
        return (bool) $user->id;
    }

    public function update(User $user, TalentList $list): bool
    {
        return (int) $list->user_id === (int) $user->id;
    }

    public function delete(User $user, TalentList $list): bool
    {
        return (int) $list->user_id === (int) $user->id;
    }
}
