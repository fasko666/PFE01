<?php

namespace App\Http\Controllers\API\Payments;

use App\Http\Controllers\Controller;
use App\Models\StripeWebhookEvent;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\LedgerService;
use App\Services\StripeService;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * StripeWebhookController — single entry point for ALL Stripe events.
 *
 * Security & reliability:
 *  - Signature verified via Stripe SDK (rejects forged requests)
 *  - Idempotency via DB unique constraint on stripe_event_id
 *  - Always returns 200 to Stripe after recording the event (so Stripe doesn't retry forever)
 *  - Actual processing failures are logged and the row is marked 'failed' for manual retry
 */
class StripeWebhookController extends Controller
{
    public function __construct(
        private StripeService                            $stripe,
        private LedgerService                            $ledger,
        private SubscriptionService                      $subscriptions,
        private \App\Services\CatalogCheckoutService     $catalogCheckout,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature', '');

        // 1. Verify signature (rejects forged requests)
        try {
            $event = $this->stripe->verifyWebhook($payload, $sigHeader);
        } catch (Throwable $e) {
            Log::warning('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        // 2. Record event idempotently
        $record = StripeWebhookEvent::firstOrCreate(
            ['stripe_event_id' => $event->id],
            [
                'type'    => $event->type,
                'payload' => json_decode(json_encode($event), true),
                'status'  => 'received',
            ]
        );

        // Already processed → return 200 silently
        if ($record->status === 'processed') {
            return response()->json(['received' => true, 'duplicate' => true]);
        }

        // 3. Process — wrap in try/catch so we ALWAYS return 200 unless signature failed
        try {
            $this->dispatch($event, $record);
            $record->update([
                'status'       => 'processed',
                'processed_at' => now(),
                'attempts'     => $record->attempts + 1,
            ]);
        } catch (Throwable $e) {
            Log::error('Stripe webhook processing failed', [
                'event_id' => $event->id,
                'type'     => $event->type,
                'error'    => $e->getMessage(),
            ]);
            $record->update([
                'status'           => 'failed',
                'processing_error' => substr($e->getMessage(), 0, 250),
                'attempts'         => $record->attempts + 1,
            ]);
            // Return 200 anyway — manual replay via admin tool. Letting Stripe retry
            // a broken handler 50x doesn't help us.
        }

        return response()->json(['received' => true]);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  Event dispatch — add new handlers here as needs grow
     * ────────────────────────────────────────────────────────────────────── */
    protected function dispatch(\Stripe\Event $event, StripeWebhookEvent $record): void
    {
        match ($event->type) {
            'checkout.session.completed'   => $this->handleCheckoutCompleted($event),
            'payment_intent.succeeded'     => $this->handlePaymentIntentSucceeded($event),
            'payment_intent.payment_failed'=> $this->handlePaymentIntentFailed($event),
            'charge.refunded'              => $this->handleChargeRefunded($event),
            'charge.dispute.created'       => $this->handleDisputeCreated($event),
            'account.updated'              => $this->handleAccountUpdated($event),
            'transfer.created',
            'transfer.paid',
            'transfer.failed'              => $this->handleTransferEvent($event),
            // Subscriptions
            'customer.subscription.created',
            'customer.subscription.updated',
            'customer.subscription.deleted'=> $this->handleSubscriptionLifecycle($event),
            'invoice.paid'                 => $this->handleInvoicePaid($event),
            'invoice.payment_failed'       => $this->handleInvoicePaymentFailed($event),
            default => $record->update(['status' => 'ignored']),
        };
    }

    /* ─── Subscriptions ───────────────────────────────────────────────── */

    /**
     * customer.subscription.created/updated/deleted → resync the local row from
     * Stripe so our DB matches Stripe's source-of-truth state.
     */
    protected function handleSubscriptionLifecycle(\Stripe\Event $event): void
    {
        $stripeSub = $event->data->object;
        $this->subscriptions->syncFromStripe($stripeSub);
    }

    /** On every successful subscription invoice, top up the user's Connects. */
    protected function handleInvoicePaid(\Stripe\Event $event): void
    {
        $invoice = $event->data->object;
        if ($invoice->billing_reason !== 'subscription_create' && $invoice->billing_reason !== 'subscription_cycle') {
            return;
        }
        $subId = $invoice->subscription ?? null;
        if (! $subId) return;

        $sub = \App\Models\Subscription::where('stripe_id', $subId)->first();
        if (! $sub) return;

        $user = $sub->user;
        if ($user) {
            $granted = $this->subscriptions->grantConnectsForRenewal($user, $sub->plan_slug);
            Log::info('Subscription invoice paid — granted Connects', [
                'user_id' => $user->id, 'plan' => $sub->plan_slug, 'granted' => $granted,
            ]);
        }
    }

    protected function handleInvoicePaymentFailed(\Stripe\Event $event): void
    {
        $invoice = $event->data->object;
        Log::warning('Subscription invoice payment failed', [
            'invoice'      => $invoice->id,
            'customer'     => $invoice->customer ?? null,
            'subscription' => $invoice->subscription ?? null,
        ]);
        // Cashier sends a `subscription_payment_failed` notification; we rely on
        // customer.subscription.updated (status → past_due) to update local state.
    }

    /* ─── Checkout session completed: dispatch by metadata.kind ─────────── */
    protected function handleCheckoutCompleted(\Stripe\Event $event): void
    {
        $session = $event->data->object;
        $meta    = $session->metadata->toArray() ?? [];
        $kind    = $meta['kind'] ?? null;

        // Catalog order paid → create contract + conversation, flip order in_progress.
        if ($kind === 'catalog_order') {
            $this->catalogCheckout->markOrderPaidFromSession($session);
            return;
        }

        if ($kind !== 'deposit') return; // not a wallet top-up

        $userId   = (int) ($meta['panda_user_id'] ?? 0);
        $amountUsd = (float) ($meta['amount_usd'] ?? 0);
        if ($userId <= 0 || $amountUsd <= 0) {
            throw new \RuntimeException("Invalid deposit metadata in session {$session->id}");
        }

        $user = User::find($userId);
        if (!$user) throw new \RuntimeException("User {$userId} not found");

        // Idempotency: use the Stripe session id as the ledger key so re-delivery
        // of the same webhook produces no extra credit.
        $this->ledger->deposit($user, $amountUsd, $session->id, [
            'description'       => 'Stripe deposit',
            'payment_method'    => 'stripe',
            'stripe_payment_id' => $session->payment_intent ?? $session->id,
        ]);
    }

    /* ─── Payment intent succeeded — backup path for non-Checkout flows ─ */
    protected function handlePaymentIntentSucceeded(\Stripe\Event $event): void
    {
        $pi   = $event->data->object;
        $meta = $pi->metadata->toArray() ?? [];

        if (($meta['kind'] ?? null) !== 'deposit') return;
        $userId    = (int) ($meta['panda_user_id'] ?? 0);
        $amountUsd = (float) ($pi->amount_received ?? 0) / 100;
        if ($userId <= 0 || $amountUsd <= 0) return;

        $user = User::find($userId);
        if (!$user) return;

        // Use payment_intent id as idempotency — checkout.session.completed
        // typically arrives first, but this ensures we cover non-Checkout flows.
        $this->ledger->deposit($user, $amountUsd, "pi:{$pi->id}", [
            'description'       => 'Stripe deposit',
            'payment_method'    => 'stripe',
            'stripe_payment_id' => $pi->id,
        ]);
    }

    protected function handlePaymentIntentFailed(\Stripe\Event $event): void
    {
        $pi = $event->data->object;
        Log::warning('Stripe payment failed', [
            'pi_id' => $pi->id,
            'last_error' => $pi->last_payment_error?->message ?? null,
        ]);
        // TODO: emit a notification to the user (notification scaffolding exists)
    }

    /**
     * charge.refunded → reverse the original deposit transaction.
     * Stripe sends the full charge object; payment_intent links it back to our
     * original deposit row (we stored it as `stripe_payment_id`).
     */
    protected function handleChargeRefunded(\Stripe\Event $event): void
    {
        $charge = $event->data->object;
        $amountRefunded = (float) ($charge->amount_refunded ?? 0) / 100;
        if ($amountRefunded <= 0) return;

        // Find the original deposit row. We prefer the payment_intent reference
        // (set by us in handleCheckoutCompleted / handlePaymentIntentSucceeded).
        $original = \App\Models\Transaction::query()
            ->where('type', 'credit')
            ->where(function ($q) use ($charge) {
                $q->where('stripe_payment_id', $charge->payment_intent)
                  ->orWhere('stripe_payment_id', $charge->id);
            })
            ->first();

        if (! $original) {
            Log::warning('Stripe refund could not be matched to a deposit', [
                'charge' => $charge->id,
                'pi'     => $charge->payment_intent ?? null,
            ]);
            return;
        }

        // Idempotency: use the charge id so retried webhooks don't double-debit.
        $key = "stripe_refund:{$charge->id}";
        $reason = 'Stripe refund (' . ($charge->refunds?->data[0]?->reason ?? 'requested') . ')';

        $this->ledger->reverseDeposit($original, $amountRefunded, $key, $reason);

        Log::info('Stripe refund applied to ledger', [
            'charge'           => $charge->id,
            'original_tx'      => $original->id,
            'amount_refunded'  => $amountRefunded,
        ]);
    }

    /**
     * charge.dispute.created → chargeback. We:
     *   1. reverse the original deposit (money is GONE from our Stripe balance)
     *   2. freeze any active contract that used those funds for escrow
     *   3. notify the user + an admin
     */
    protected function handleDisputeCreated(\Stripe\Event $event): void
    {
        $dispute = $event->data->object;
        $amount  = (float) ($dispute->amount ?? 0) / 100;

        $original = \App\Models\Transaction::query()
            ->where('type', 'credit')
            ->where('stripe_payment_id', $dispute->payment_intent ?? $dispute->charge)
            ->first();

        if (! $original) {
            Log::warning('Stripe dispute could not be matched to a deposit', [
                'dispute' => $dispute->id,
                'charge'  => $dispute->charge,
            ]);
            return;
        }

        $key = "stripe_dispute:{$dispute->id}";
        $this->ledger->reverseDeposit($original, $amount, $key, "Stripe dispute: {$dispute->reason}");

        // Freeze every active contract this user funded — disputed escrow can no
        // longer be released safely.
        $contracts = \App\Models\Contract::query()
            ->where('client_id', $original->user_id)
            ->whereIn('status', ['active', 'paused', 'pending'])
            ->get();
        foreach ($contracts as $contract) {
            $this->ledger->freezeContract($contract, "Chargeback disputed by client (Stripe dispute {$dispute->id})");
        }

        Log::warning('Stripe dispute frozen contracts', [
            'dispute'         => $dispute->id,
            'user_id'         => $original->user_id,
            'amount'          => $amount,
            'contracts_frozen' => $contracts->pluck('id')->all(),
        ]);
    }

    /* ─── Connect account updated — refresh local snapshot ────────────── */
    protected function handleAccountUpdated(\Stripe\Event $event): void
    {
        $account = $event->data->object;
        $user = User::where('stripe_account_id', $account->id)->first();
        if ($user) $this->stripe->syncConnectStatus($user);
    }

    /* ─── Transfer events — keep withdrawal record in sync ────────────── */
    protected function handleTransferEvent(\Stripe\Event $event): void
    {
        $transfer = $event->data->object;
        $withdrawalId = $transfer->metadata->panda_withdrawal_id ?? null;
        if (!$withdrawalId) return;

        $w = Withdrawal::find($withdrawalId);
        if (!$w) return;

        $newStatus = match ($event->type) {
            'transfer.paid'   => 'completed',
            'transfer.failed' => 'failed',
            default           => $w->status,
        };

        $updates = ['status' => $newStatus, 'stripe_transfer_id' => $transfer->id];
        if ($newStatus === 'completed') $updates['completed_at'] = now();
        $w->update($updates);
    }
}
