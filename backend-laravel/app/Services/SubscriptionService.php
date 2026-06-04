<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\SubscriptionItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Stripe\BillingPortal\Session as PortalSession;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Invoice as StripeInvoice;
use Stripe\Subscription as StripeSubscription;

/**
 * Native Stripe subscription orchestration.
 *
 * We delegate Stripe customer creation to StripeService::ensureCustomer (already
 * battle-tested in the deposit flow). All subscription operations go through
 * this single service so policy/controller layers never touch the Stripe SDK
 * directly.
 *
 * Webhook reconciliation happens in StripeWebhookController (subscription.*
 * events flow into syncFromStripe()), so this service is the WRITE path and
 * the webhook is the SOURCE-OF-TRUTH READ path.
 */
class SubscriptionService
{
    public function __construct(private StripeService $stripe) {}

    /**
     * Build a Stripe Checkout session for subscribing to $planSlug.
     * The user completes payment + payment method capture on Stripe's page.
     * On `checkout.session.completed`, the webhook calls syncFromStripe().
     */
    public function createSubscriptionCheckout(User $user, string $planSlug): CheckoutSession
    {
        $plan = $this->requirePlan($planSlug);
        if (! $plan['stripe_price']) {
            throw new RuntimeException("Plan {$planSlug} has no Stripe price configured");
        }

        $customerId = $this->stripe->ensureCustomer($user);

        return CheckoutSession::create([
            'mode'        => 'subscription',
            'customer'    => $customerId,
            'line_items'  => [[ 'price' => $plan['stripe_price'], 'quantity' => 1 ]],
            'success_url' => rtrim((string) config('app.url'), '/').'/billing?subscribed=1',
            'cancel_url'  => rtrim((string) config('app.url'), '/').'/pricing',
            'metadata'    => [
                'kind'           => 'subscription',
                'panda_user_id'  => $user->id,
                'plan_slug'      => $planSlug,
            ],
            'subscription_data' => [
                'metadata' => [
                    'panda_user_id' => $user->id,
                    'plan_slug'     => $planSlug,
                ],
            ],
        ]);
    }

    /**
     * Swap an existing subscription to a different plan.
     * Stripe handles proration automatically. The webhook then syncs locally.
     */
    public function swapPlan(Subscription $subscription, string $newPlanSlug): Subscription
    {
        $plan = $this->requirePlan($newPlanSlug);
        if (! $plan['stripe_price']) {
            throw new RuntimeException("Cannot swap to {$newPlanSlug}: no Stripe price");
        }

        $stripeSub = StripeSubscription::retrieve($subscription->stripe_id);
        $itemId    = $stripeSub->items->data[0]->id ?? null;
        if (! $itemId) throw new RuntimeException('Stripe subscription has no items to swap');

        StripeSubscription::update($subscription->stripe_id, [
            'cancel_at_period_end' => false,
            'proration_behavior'   => 'create_prorations',
            'items' => [[ 'id' => $itemId, 'price' => $plan['stripe_price'] ]],
            'metadata' => ['plan_slug' => $newPlanSlug],
        ]);

        // Optimistically update; webhook will re-sync as ground truth.
        $subscription->update([
            'plan_slug'    => $newPlanSlug,
            'stripe_price' => $plan['stripe_price'],
            'ends_at'      => null,
        ]);
        return $subscription->fresh();
    }

    /**
     * Cancel at period-end. The user keeps access until ends_at.
     * On `customer.subscription.deleted` webhook we transition stripe_status
     * to 'canceled'.
     */
    public function cancel(Subscription $subscription): Subscription
    {
        $updated = StripeSubscription::update($subscription->stripe_id, [
            'cancel_at_period_end' => true,
        ]);
        $subscription->update([
            'ends_at' => $updated->current_period_end
                ? \Carbon\Carbon::createFromTimestamp($updated->current_period_end)
                : now(),
        ]);
        return $subscription->fresh();
    }

    /** Undo a cancel-at-period-end while still in the grace period. */
    public function resume(Subscription $subscription): Subscription
    {
        if (! $subscription->onGracePeriod()) {
            throw new RuntimeException('Subscription is not in a grace period');
        }
        StripeSubscription::update($subscription->stripe_id, [
            'cancel_at_period_end' => false,
        ]);
        $subscription->update(['ends_at' => null]);
        return $subscription->fresh();
    }

    /** Stripe Billing Portal — lets the user manage cards / invoices themselves. */
    public function billingPortalUrl(User $user, ?string $returnUrl = null): string
    {
        $customerId = $this->stripe->ensureCustomer($user);
        $session = PortalSession::create([
            'customer'   => $customerId,
            'return_url' => $returnUrl ?: rtrim((string) config('app.url'), '/').'/billing',
        ]);
        return $session->url;
    }

    /** Recent invoices for the user. Returns simplified array for the frontend. */
    public function invoices(User $user, int $limit = 25): array
    {
        if (! $user->stripe_customer_id) return [];

        $invoices = StripeInvoice::all([
            'customer' => $user->stripe_customer_id,
            'limit'    => max(1, min(100, $limit)),
        ]);

        return collect($invoices->data)->map(fn ($inv) => [
            'id'              => $inv->id,
            'number'          => $inv->number,
            'status'          => $inv->status,
            'amount_paid'     => $inv->amount_paid / 100,
            'amount_due'      => $inv->amount_due / 100,
            'currency'        => strtoupper($inv->currency ?? 'usd'),
            'created'         => date('c', $inv->created),
            'period_start'    => $inv->period_start ? date('c', $inv->period_start) : null,
            'period_end'      => $inv->period_end   ? date('c', $inv->period_end)   : null,
            'hosted_url'      => $inv->hosted_invoice_url,
            'pdf'             => $inv->invoice_pdf,
            'description'     => $inv->lines->data[0]->description ?? null,
        ])->all();
    }

    /**
     * Source-of-truth sync from Stripe. Called from:
     *   - SubscriptionController after Checkout completes (defensive)
     *   - StripeWebhookController on every customer.subscription.* event
     */
    public function syncFromStripe(StripeSubscription $stripeSub): ?Subscription
    {
        $userId = (int) ($stripeSub->metadata->panda_user_id ?? 0);
        if ($userId <= 0) {
            // Fall back to customer lookup
            $user = User::where('stripe_customer_id', $stripeSub->customer)->first();
            if (! $user) return null;
            $userId = $user->id;
        }

        $planSlug = (string) ($stripeSub->metadata->plan_slug ?? '');
        if ($planSlug === '') {
            // derive from price
            $priceId  = $stripeSub->items->data[0]->price->id ?? null;
            $planSlug = $this->planSlugFromPrice($priceId) ?? 'free';
        }

        return DB::transaction(function () use ($stripeSub, $userId, $planSlug) {
            $sub = Subscription::updateOrCreate(
                ['stripe_id' => $stripeSub->id],
                [
                    'user_id'        => $userId,
                    'type'           => 'default',
                    'stripe_status'  => $stripeSub->status,
                    'stripe_price'   => $stripeSub->items->data[0]->price->id ?? null,
                    'plan_slug'      => $planSlug,
                    'quantity'       => $stripeSub->items->data[0]->quantity ?? 1,
                    'trial_ends_at'  => $stripeSub->trial_end ? \Carbon\Carbon::createFromTimestamp($stripeSub->trial_end) : null,
                    'ends_at'        => $stripeSub->cancel_at_period_end && $stripeSub->current_period_end
                        ? \Carbon\Carbon::createFromTimestamp($stripeSub->current_period_end)
                        : ($stripeSub->canceled_at ? \Carbon\Carbon::createFromTimestamp($stripeSub->canceled_at) : null),
                ]
            );

            // Sync items
            $sub->items()->delete();
            foreach ($stripeSub->items->data as $item) {
                SubscriptionItem::create([
                    'subscription_id' => $sub->id,
                    'stripe_id'       => $item->id,
                    'stripe_product'  => $item->price->product,
                    'stripe_price'    => $item->price->id,
                    'quantity'        => $item->quantity ?? 1,
                ]);
            }
            return $sub;
        });
    }

    /** On invoice paid, top up the user's Connects (capped). */
    public function grantConnectsForRenewal(User $user, string $planSlug): int
    {
        $monthly = (int) (config("plans.plans.{$planSlug}.features.connects_monthly", 0));
        if ($monthly <= 0) return 0;

        $cap = (int) config('plans.connects_max_cap', 200);
        $new = min($cap, (int) $user->connects_balance + $monthly);
        $delta = $new - (int) $user->connects_balance;
        if ($delta > 0) {
            $user->forceFill(['connects_balance' => $new])->save();
        }
        return $delta;
    }

    /* ── helpers ────────────────────────────────────────────────────────── */

    private function requirePlan(string $slug): array
    {
        $plan = config("plans.plans.{$slug}");
        if (! $plan) throw new RuntimeException("Unknown plan: {$slug}");
        return $plan;
    }

    private function planSlugFromPrice(?string $priceId): ?string
    {
        if (! $priceId) return null;
        foreach ((array) config('plans.plans') as $slug => $plan) {
            if (($plan['stripe_price'] ?? null) === $priceId) return $slug;
        }
        return null;
    }
}
