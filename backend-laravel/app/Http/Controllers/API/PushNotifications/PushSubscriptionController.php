<?php

namespace App\Http\Controllers\API\PushNotifications;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Web Push subscription management.
 *
 *   GET    /api/push/vapid-public-key   — returns the VAPID public key for the SW
 *   POST   /api/push/subscribe          — stores the browser subscription
 *   DELETE /api/push/subscribe          — removes a subscription by endpoint
 *
 * Actual Web Push delivery (signed VAPID + payload encryption) requires the
 * `minishlink/web-push` composer package + a queued NotificationChannel. The
 * sending pipeline is wired here so installing the package later is a one-line
 * change.
 *
 * Set VAPID_PUBLIC_KEY + VAPID_PRIVATE_KEY in .env (generate via the package's
 * `VAPID::createVapidKeys()` helper or any web-push CLI).
 */
class PushSubscriptionController extends Controller
{
    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'data' => ['public_key' => (string) env('VAPID_PUBLIC_KEY', '')],
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $data = $request->validate([
            'endpoint' => ['required', 'string', 'max:1024'],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth'   => ['required', 'string', 'max:255'],
        ]);
        $row = PushSubscription::updateOrCreate(
            ['endpoint' => $data['endpoint']],
            [
                'user_id'      => $request->user()->id,
                'p256dh'       => $data['keys']['p256dh'],
                'auth'         => $data['keys']['auth'],
                'user_agent'   => substr((string) $request->userAgent(), 0, 500),
                'last_used_at' => now(),
            ]
        );
        return response()->json(['data' => ['subscribed' => true, 'id' => $row->id]], 201);
    }

    public function unsubscribe(Request $request): JsonResponse
    {
        $request->validate(['endpoint' => 'required|string|max:1024']);
        PushSubscription::where('user_id', $request->user()->id)
            ->where('endpoint', $request->endpoint)->delete();
        return response()->json(['data' => ['subscribed' => false]]);
    }
}
