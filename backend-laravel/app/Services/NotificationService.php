<?php

namespace App\Services;

use App\Events\NotificationCreated;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Single entry point for "send a domain notification to a user."
 *
 * Writes a row to the existing `notifications` table (the same shape used by
 * NotificationController::index + the React notificationStore) and broadcasts
 * NotificationCreated on private-user.{id} so the UI badge updates without
 * polling. Stays compatible with the existing index/markRead endpoints.
 */
class NotificationService
{
    /**
     * Send a notification to a user.
     *
     * @param  array{type:string,title:string,body:string,action_url?:string,icon?:string}  $payload
     */
    public function send(User $user, array $payload): string
    {
        $payload = array_merge([
            'icon'       => 'bell',
            'action_url' => null,
        ], $payload);

        $id  = (string) Str::uuid();
        $now = now();

        DB::table('notifications')->insert([
            'id'              => $id,
            'type'            => 'App\\Notifications\\PlatformNotification',
            'notifiable_id'   => $user->id,
            'notifiable_type' => User::class,
            'data'            => json_encode($payload),
            'read_at'         => null,
            'created_at'      => $now,
            'updated_at'      => $now,
        ]);

        $unread = DB::table('notifications')
            ->where('notifiable_id', $user->id)
            ->where('notifiable_type', User::class)
            ->whereNull('read_at')
            ->count();

        broadcast(new NotificationCreated(
            userId:      $user->id,
            payload:     array_merge(['id' => $id, 'created_at' => $now->toIso8601String()], $payload),
            unreadCount: $unread,
        ));

        return $id;
    }
}
