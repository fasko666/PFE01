<?php

namespace App\Http\Controllers\API\Notifications;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId   = $request->user()->id;
        $userType = get_class($request->user());

        $rows = DB::table('notifications')
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', $userType)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        $notifications = $rows->map(function ($n) {
            $data = json_decode($n->data, true) ?: [];
            return [
                'id'         => $n->id,
                'type'       => $data['type']       ?? 'system',
                'title'      => $data['title']      ?? 'Notification',
                'body'       => $data['body']        ?? '',
                'action_url' => $data['action_url'] ?? null,
                'icon'       => $data['icon']        ?? 'bell',
                'read_at'    => $n->read_at,
                'created_at' => $n->created_at,
            ];
        });

        $unreadCount = DB::table('notifications')
            ->where('notifiable_id', $userId)
            ->where('notifiable_type', $userType)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        DB::table('notifications')
            ->where('id', $id)
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        DB::table('notifications')
            ->where('notifiable_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['success' => true]);
    }

    /** Seed demo notifications after login (called by AuthController) */
    public static function seedForUser(int $userId, string $userType, string $role): void
    {
        $existing = DB::table('notifications')
            ->where('notifiable_id', $userId)
            ->count();

        if ($existing > 0) return;

        $templates = [
            'freelancer' => [
                ['type' => 'proposal', 'icon' => 'file',    'title' => 'Proposal accepted!',        'body'  => 'TechStartup Inc accepted your proposal for the SaaS Dashboard project.', 'action_url' => '/my-proposals'],
                ['type' => 'message',  'icon' => 'message', 'title' => 'New message from client',   'body'  => 'You have a new message regarding the React Native app project.', 'action_url' => '/messages'],
                ['type' => 'payment',  'icon' => 'payment', 'title' => '$480 released to wallet',   'body'  => 'Milestone payment released. Funds are now available in your wallet.', 'action_url' => '/payments'],
                ['type' => 'review',   'icon' => 'star',    'title' => '5★ review received',        'body'  => 'James R. left you a 5-star review: "Exceptional work, highly recommended!"', 'action_url' => '/freelancer/profile'],
                ['type' => 'system',   'icon' => 'bell',    'title' => 'Profile viewed 12 times',   'body'  => 'Your profile was viewed 12 times this week. Consider updating your portfolio.', 'action_url' => '/freelancer/profile'],
            ],
            'client' => [
                ['type' => 'proposal', 'icon' => 'file',    'title' => '5 new proposals received',  'body'  => 'Your "SaaS Dashboard" job has 5 new proposals ready for review.', 'action_url' => '/my-jobs'],
                ['type' => 'message',  'icon' => 'message', 'title' => 'Freelancer sent a message', 'body'  => 'Youness Ben Abbou sent you a message about the project timeline.', 'action_url' => '/messages'],
                ['type' => 'payment',  'icon' => 'payment', 'title' => 'Escrow funded successfully','body'  => '$2,400 has been placed in escrow for the milestone "UI Design Phase".', 'action_url' => '/payments'],
                ['type' => 'system',   'icon' => 'bell',    'title' => 'AI matched 3 top talents',  'body'  => 'Based on your job posting, AI matched 3 highly-rated freelancers for you.', 'action_url' => '/my-jobs'],
            ],
            'admin' => [
                ['type' => 'system',   'icon' => 'bell',    'title' => '12 new users this week',    'body'  => 'Platform growth: 12 new registrations in the past 7 days.', 'action_url' => '/admin/dashboard'],
                ['type' => 'system',   'icon' => 'shield',  'title' => 'Suspicious login attempt',  'body'  => 'Multiple failed login attempts detected from IP 192.168.1.45.', 'action_url' => '/admin/dashboard'],
                ['type' => 'payment',  'icon' => 'payment', 'title' => 'Platform revenue: $8,420',  'body'  => 'Total platform commission collected this month: $8,420.', 'action_url' => '/admin/dashboard'],
            ],
        ];

        $items = $templates[$role] ?? $templates['freelancer'];
        $now   = now();

        foreach ($items as $i => $item) {
            DB::table('notifications')->insert([
                'id'             => (string) Str::uuid(),
                'type'           => 'App\\Notifications\\PlatformNotification',
                'notifiable_id'  => $userId,
                'notifiable_type'=> $userType,
                'data'           => json_encode($item),
                'read_at'        => null,
                'created_at'     => $now->copy()->subMinutes(($i + 1) * 15),
                'updated_at'     => $now->copy()->subMinutes(($i + 1) * 15),
            ]);
        }
    }
}
