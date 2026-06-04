<?php

namespace App\Http\Controllers\API\Billing;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Services\AuditLogService;
use App\Services\SubscriptionService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

/**
 * Subscription HTTP API.
 *
 *   GET    /api/plans                         — list configured plans (public)
 *   GET    /api/billing/subscription          — current user's active subscription + plan features
 *   POST   /api/billing/checkout              — Stripe Checkout for { plan_slug }
 *   POST   /api/billing/swap                  — change plan { plan_slug }
 *   POST   /api/billing/cancel                — cancel at period-end
 *   POST   /api/billing/resume                — undo a pending cancel
 *   GET    /api/billing/portal                — Stripe billing-portal URL
 *   GET    /api/billing/invoices              — recent invoice list
 *
 * Authorization: the SubscriptionPolicy (registered in AppServiceProvider) gates
 * `update`/`cancel` per row; the controller checks `view` for index/show.
 */
class SubscriptionController extends Controller
{
    public function __construct(
        private SubscriptionService $subs,
        private AuditLogService     $audit,
    ) {}

    /** Public — pricing page reads this so plan changes never need a frontend rebuild. */
    public function plans(): JsonResponse
    {
        $plans = collect(config('plans.plans'))->map(function ($p, $slug) {
            return [
                'slug'           => $slug,
                'name'           => $p['name'],
                'tagline'        => $p['tagline'] ?? null,
                'price_monthly'  => $p['price_monthly'] ?? 0,
                'price_yearly'   => $p['price_yearly']  ?? null,
                'audience'       => $p['audience']      ?? [],
                'featured'       => (bool) ($p['featured'] ?? false),
                'features'       => $p['features']      ?? [],
                'purchasable'    => ! empty($p['stripe_price']),
            ];
        })->values();

        return response()->json(['data' => [
            'plans'     => $plans,
            'hierarchy' => config('plans.hierarchy'),
        ]]);
    }

    /** Currently-active subscription for the authenticated user. */
    public function current(Request $request): JsonResponse
    {
        $sub = $request->user()->subscriptions()->where('type', 'default')->latest()->first();
        $slug = ($sub && $sub->active()) ? $sub->plan_slug : 'free';

        return response()->json(['data' => [
            'subscription'  => $sub,
            'active'        => (bool) ($sub && $sub->active()),
            'on_grace'      => (bool) ($sub && $sub->onGracePeriod()),
            'plan_slug'     => $slug,
            'plan'          => config("plans.plans.{$slug}"),
            'connects_balance' => (int) $request->user()->connects_balance,
        ]]);
    }

    /** POST /api/billing/checkout — kicks off Stripe Checkout. */
    public function checkout(Request $request): JsonResponse
    {
        $request->validate([
            'plan_slug' => 'required|string',
        ]);

        try {
            $session = $this->subs->createSubscriptionCheckout(
                $request->user(),
                $request->input('plan_slug'),
            );
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->audit->log('subscription.checkout_started', $request->user()->id, null, [
            'plan_slug'  => $request->input('plan_slug'),
            'session_id' => $session->id,
        ]);

        return response()->json(['data' => [
            'session_id'   => $session->id,
            'checkout_url' => $session->url,
        ]]);
    }

    /** POST /api/billing/swap */
    public function swap(Request $request): JsonResponse
    {
        $request->validate(['plan_slug' => 'required|string']);

        $sub = $this->findActiveOrFail($request);
        if (! $request->user()->can('update', $sub)) throw new AuthorizationException();

        try {
            $sub = $this->subs->swapPlan($sub, $request->input('plan_slug'));
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->audit->log('subscription.swapped', $request->user()->id, $sub, [
            'new_plan' => $request->input('plan_slug'),
        ]);

        return response()->json(['data' => $sub]);
    }

    /** POST /api/billing/cancel */
    public function cancel(Request $request): JsonResponse
    {
        $sub = $this->findActiveOrFail($request);
        if (! $request->user()->can('cancel', $sub)) throw new AuthorizationException();

        try {
            $sub = $this->subs->cancel($sub);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->audit->log('subscription.canceled', $request->user()->id, $sub);
        return response()->json(['data' => $sub]);
    }

    /** POST /api/billing/resume */
    public function resume(Request $request): JsonResponse
    {
        $sub = $this->findActiveOrFail($request);
        if (! $request->user()->can('update', $sub)) throw new AuthorizationException();

        try {
            $sub = $this->subs->resume($sub);
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        $this->audit->log('subscription.resumed', $request->user()->id, $sub);
        return response()->json(['data' => $sub]);
    }

    /** GET /api/billing/portal */
    public function portal(Request $request): JsonResponse
    {
        try {
            $url = $this->subs->billingPortalUrl($request->user());
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['data' => ['url' => $url]]);
    }

    /** GET /api/billing/invoices */
    public function invoices(Request $request): JsonResponse
    {
        try {
            $invoices = $this->subs->invoices($request->user());
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
        return response()->json(['data' => $invoices]);
    }

    /* ── helpers ────────────────────────────────────────────────────────── */

    private function findActiveOrFail(Request $request): Subscription
    {
        $sub = $request->user()->subscriptions()->where('type', 'default')->latest()->first();
        if (! $sub) {
            abort(response()->json(['message' => 'You have no active subscription.'], 404));
        }
        return $sub;
    }
}
