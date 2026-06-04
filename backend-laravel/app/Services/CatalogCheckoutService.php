<?php

namespace App\Services;

use App\Models\CatalogOrder;
use App\Models\CatalogProject;
use App\Models\Contract;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Stripe\Checkout\Session as CheckoutSession;

/**
 * Handles the buy-a-catalog-service flow.
 *
 * Flow:
 *   1. createCheckout(buyer, project, tier, requirements)
 *      → creates CatalogOrder row in pending_payment + Stripe Checkout session
 *      → returns Stripe URL for redirect
 *   2. When `checkout.session.completed` arrives in StripeWebhookController,
 *      we call `markOrderPaidFromSession()` which:
 *      a) creates a Contract (fixed, amount=tier.price, escrow=tier.price)
 *      b) creates a Conversation between buyer + seller
 *      c) transitions order → in_progress
 *
 * Money model: the buyer pays Stripe directly (NOT funded from wallet escrow).
 * On webhook, the platform debits Stripe and credits the contract's escrow_amount.
 * Subsequent milestone release follows the existing LedgerService::releaseMilestone
 * path. For v1, we auto-create a single milestone = full price so the existing
 * release flow works unchanged.
 */
class CatalogCheckoutService
{
    public function __construct(private StripeService $stripe, private LedgerService $ledger) {}

    public function createCheckout(User $buyer, CatalogProject $project, string $tier, ?string $requirements): array
    {
        $tierData = $project->tier($tier);
        if (! $tierData) throw new RuntimeException("Unknown tier: {$tier}");
        if ($project->status !== 'published') throw new RuntimeException('Project is not available for purchase.');
        if ((int) $buyer->id === (int) $project->seller_id) throw new RuntimeException('You cannot buy your own service.');

        $price = (float) ($tierData['price'] ?? 0);
        if ($price <= 0) throw new RuntimeException('Invalid tier price.');

        $order = DB::transaction(function () use ($buyer, $project, $tier, $tierData, $price, $requirements) {
            return CatalogOrder::create([
                'catalog_project_id' => $project->id,
                'buyer_id'           => $buyer->id,
                'seller_id'          => $project->seller_id,
                'tier'               => $tier,
                'price'              => $price,
                'delivery_days'      => (int) ($tierData['delivery_days'] ?? 7),
                'revisions_allowed'  => (int) ($tierData['revisions'] ?? 0),
                'requirements'       => $requirements,
                'status'             => 'pending_payment',
            ]);
        });

        $customerId = $this->stripe->ensureCustomer($buyer);

        $session = CheckoutSession::create([
            'mode'        => 'payment',
            'customer'    => $customerId,
            'line_items'  => [[
                'quantity'   => 1,
                'price_data' => [
                    'currency'    => 'usd',
                    'unit_amount' => (int) round($price * 100),
                    'product_data'=> [
                        'name'        => "{$project->title} — " . ucfirst($tier),
                        'description' => mb_substr($project->description, 0, 250),
                    ],
                ],
            ]],
            'success_url' => rtrim((string) config('app.url'), '/') . '/catalog/orders/' . $order->id . '?paid=1',
            'cancel_url'  => rtrim((string) config('app.url'), '/') . '/catalog/' . $project->slug,
            'metadata' => [
                'kind'             => 'catalog_order',
                'panda_order_id'   => $order->id,
                'panda_buyer_id'   => $buyer->id,
                'panda_project_id' => $project->id,
            ],
        ]);

        $order->update(['stripe_session_id' => $session->id]);

        return ['order' => $order->fresh(), 'session' => $session];
    }

    /**
     * Called from StripeWebhookController on checkout.session.completed when
     * metadata.kind === 'catalog_order'. Idempotent: if the order is already
     * in_progress we return early.
     *
     * Accepts any object exposing ->metadata->panda_order_id, ->payment_intent,
     * and ->id. In production this is a Stripe\Checkout\Session; tests use a
     * duck-typed stdClass to avoid hitting Stripe.
     */
    public function markOrderPaidFromSession(object $session): ?CatalogOrder
    {
        $orderId = (int) ($session->metadata->panda_order_id ?? 0);
        if ($orderId <= 0) return null;

        return DB::transaction(function () use ($session, $orderId) {
            $order = CatalogOrder::lockForUpdate()->find($orderId);
            if (! $order || $order->status !== 'pending_payment') return $order;

            $project = $order->project;
            if (! $project) return null;

            // 1. Create the Contract (fixed-price, escrow = full price)
            $contract = Contract::create([
                'job_id'        => null,
                'proposal_id'   => null,
                'client_id'     => $order->buyer_id,
                'freelancer_id' => $order->seller_id,
                'title'         => $project->title,
                'description'   => "Catalog order #{$order->id} — {$project->title} ({$order->tier})",
                'type'          => 'fixed',
                'amount'        => $order->price,
                'escrow_amount' => $order->price,
                'status'        => 'active',
                'started_at'    => now(),
                'deadline_at'   => now()->addDays($order->delivery_days),
            ]);

            // 2. Credit the seller's escrow accounting — buyer's escrow_balance on the
            //    wallet doesn't apply here because the funds came from Stripe directly,
            //    not from the buyer's wallet. We still record a transaction to track.
            \App\Models\Transaction::create([
                'wallet_id'       => optional(\App\Models\Wallet::firstOrCreate(['user_id' => $order->buyer_id], ['balance' => 0]))->id,
                'user_id'         => $order->buyer_id,
                'counterparty_user_id' => $order->seller_id,
                'contract_id'     => $contract->id,
                'idempotency_key' => "catalog:{$order->id}:escrow",
                'reference'       => 'CAT-' . strtoupper(substr(md5($session->id), 0, 12)),
                'type'            => 'escrow',
                'direction'       => 'out',
                'amount'          => $order->price,
                'balance_after'   => 0,
                'status'          => 'completed',
                'description'     => "Catalog order #{$order->id} — escrow funded via Stripe",
                'payment_method'  => 'stripe',
                'stripe_payment_id'=> $session->payment_intent ?? $session->id,
            ]);

            // 3. Create the conversation between buyer + seller
            $convo = Conversation::create([
                'type'        => 'contract',
                'contract_id' => $contract->id,
                'title'       => $project->title,
            ]);
            $convo->participants()->attach([$order->buyer_id, $order->seller_id]);

            // 4. Update order
            $order->update([
                'status'          => 'in_progress',
                'contract_id'     => $contract->id,
                'conversation_id' => $convo->id,
                'paid_at'         => now(),
            ]);

            $project->increment('orders_count');

            return $order->fresh();
        });
    }
}
