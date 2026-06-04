<?php

namespace App\Policies;

use App\Models\CatalogOrder;
use App\Models\User;

class CatalogOrderPolicy
{
    public function view(User $user, CatalogOrder $order): bool
    {
        return $user->role === 'admin'
            || (int) $order->buyer_id === (int) $user->id
            || (int) $order->seller_id === (int) $user->id;
    }

    public function review(User $user, CatalogOrder $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id
            && in_array($order->status, ['delivered', 'completed'], true);
    }

    public function deliver(User $user, CatalogOrder $order): bool
    {
        return (int) $order->seller_id === (int) $user->id
            && $order->status === 'in_progress';
    }

    public function complete(User $user, CatalogOrder $order): bool
    {
        return (int) $order->buyer_id === (int) $user->id
            && $order->status === 'delivered';
    }
}
