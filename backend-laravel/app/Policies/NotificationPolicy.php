<?php

namespace App\Policies;

use App\Models\User;

class NotificationPolicy
{
    /** Notifications are scoped to the notifiable user. */
    public function view(User $user, object $notification): bool
    {
        $ownerId = $notification->notifiable_id ?? $notification['notifiable_id'] ?? null;
        return (int) $ownerId === (int) $user->id;
    }

    public function markRead(User $user, object $notification): bool
    {
        return $this->view($user, $notification);
    }

    public function markAllRead(User $user): bool
    {
        return (bool) $user->id;
    }
}
