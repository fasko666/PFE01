<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Wallet;

class WalletPolicy
{
    public function view(User $user, Wallet $wallet): bool
    {
        return $user->role === 'admin' || (int) $wallet->user_id === (int) $user->id;
    }

    public function deposit(User $user, Wallet $wallet): bool
    {
        return (int) $wallet->user_id === (int) $user->id;
    }

    public function withdraw(User $user, Wallet $wallet): bool
    {
        return (int) $wallet->user_id === (int) $user->id;
    }
}
