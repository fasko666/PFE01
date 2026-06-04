<?php

namespace App\Services;

use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\Checkout\Session as CheckoutSession;
use Stripe\Customer;
use Stripe\Stripe;
use Stripe\StripeClient;
use Stripe\Transfer;
use Stripe\Webhook;

/**
 * StripeService — every Stripe SDK call goes through here.
 *
 * Test mode vs production: drive entirely by the STRIPE_SECRET env var
 *   sk_test_…  → Stripe test mode
 *   sk_live_…  → Stripe live mode
 * No code changes needed to switch.
 */
class StripeService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        $key = config('services.stripe.secret');
        if (!$key) {
            // Service can still be instantiated when key is missing — calls will fail loudly.
            // This lets the rest of the system boot without Stripe configured.
            $this->stripe = new StripeClient(['api_key' => 'sk_test_placeholder']);
            return;
        }
        Stripe::setApiKey($key);
        $this->stripe = new StripeClient($key);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  CUSTOMER (client side — for Checkout sessions)
     * ────────────────────────────────────────────────────────────────────── */
    public function ensureCustomer(User $user): string
    {
        if ($user->stripe_customer_id) return $user->stripe_customer_id;

        $customer = Customer::create([
            'email' => $user->email,
            'name'  => $user->name,
            'metadata' => ['panda_user_id' => $user->id],
        ]);

        $user->forceFill(['stripe_customer_id' => $customer->id])->save();
        return $customer->id;
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  CHECKOUT — deposit funds into PANDA wallet
     *  Returns the Checkout Session (use ->url for redirect)
     * ────────────────────────────────────────────────────────────────────── */
    public function createDepositCheckout(User $user, float $amountUsd, ?string $idempotencyKey = null): CheckoutSession
    {
        $this->assertConfigured();

        $customerId = $this->ensureCustomer($user);
        $amountCents = (int) round($amountUsd * 100);

        return CheckoutSession::create([
            'mode'                 => 'payment',
            'customer'             => $customerId,
            'payment_method_types' => ['card'],
            'line_items' => [[
                'quantity'   => 1,
                'price_data' => [
                    'currency'     => 'usd',
                    'unit_amount'  => $amountCents,
                    'product_data' => [
                        'name'        => 'PANDA Wallet Deposit',
                        'description' => "Top up your PANDA wallet by \${$amountUsd}",
                    ],
                ],
            ]],
            'success_url' => config('services.stripe.success_url'),
            'cancel_url'  => config('services.stripe.cancel_url'),
            'metadata' => [
                'kind'           => 'deposit',
                'panda_user_id'  => $user->id,
                'amount_usd'     => $amountUsd,
            ],
            'payment_intent_data' => [
                'metadata' => [
                    'kind'          => 'deposit',
                    'panda_user_id' => $user->id,
                ],
            ],
        ], $idempotencyKey ? ['idempotency_key' => $idempotencyKey] : []);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  CONNECT — freelancer payout onboarding
     * ────────────────────────────────────────────────────────────────────── */
    public function ensureConnectAccount(User $freelancer): string
    {
        $this->assertConfigured();
        if ($freelancer->stripe_account_id) return $freelancer->stripe_account_id;

        $account = Account::create([
            'type'    => 'express',
            'country' => $freelancer->country ?: 'US',
            'email'   => $freelancer->email,
            'capabilities' => [
                'transfers' => ['requested' => true],
                'card_payments' => ['requested' => true],
            ],
            'business_type' => 'individual',
            'metadata' => ['panda_user_id' => $freelancer->id],
        ]);

        $freelancer->forceFill([
            'stripe_account_id'     => $account->id,
            'stripe_account_status' => 'pending',
        ])->save();

        return $account->id;
    }

    /**
     * Returns an onboarding URL the freelancer can visit to complete KYC.
     */
    public function createOnboardingLink(User $freelancer): string
    {
        $this->assertConfigured();
        $accountId = $this->ensureConnectAccount($freelancer);

        $link = AccountLink::create([
            'account'     => $accountId,
            'refresh_url' => config('services.stripe.connect_refresh_url'),
            'return_url'  => config('services.stripe.connect_return_url'),
            'type'        => 'account_onboarding',
        ]);

        return $link->url;
    }

    /**
     * Refresh local snapshot of the Connect account (capabilities, status).
     * Call after onboarding return + during withdrawal eligibility checks.
     */
    public function syncConnectStatus(User $freelancer): array
    {
        $this->assertConfigured();
        if (!$freelancer->stripe_account_id) {
            return ['status' => 'none', 'payouts_enabled' => false];
        }

        $account = Account::retrieve($freelancer->stripe_account_id);

        $payoutsEnabled = (bool) $account->payouts_enabled;
        $chargesEnabled = (bool) $account->charges_enabled;

        $status = match (true) {
            $payoutsEnabled && $chargesEnabled => 'active',
            !empty($account->requirements?->disabled_reason) => 'restricted',
            $account->details_submitted === false             => 'pending',
            default => 'active',
        };

        $freelancer->forceFill([
            'stripe_account_status'    => $status,
            'stripe_charges_enabled'   => $chargesEnabled,
            'stripe_payouts_enabled'   => $payoutsEnabled,
            'stripe_onboarded_at'      => $freelancer->stripe_onboarded_at ?? ($payoutsEnabled ? now() : null),
        ])->save();

        return [
            'status'           => $status,
            'payouts_enabled'  => $payoutsEnabled,
            'charges_enabled'  => $chargesEnabled,
            'requirements'     => $account->requirements,
        ];
    }

    /**
     * Transfer net amount to the freelancer's Connect account.
     * Called from LedgerService::approveWithdrawal once admin approves.
     */
    public function sendPayout(User $freelancer, float $amountUsd, Withdrawal $withdrawal): Transfer
    {
        $this->assertConfigured();
        if (!$freelancer->stripe_account_id) {
            throw new RuntimeException('Freelancer has not connected a Stripe account');
        }
        if (!$freelancer->stripe_payouts_enabled) {
            throw new RuntimeException('Freelancer Connect account is not yet eligible for payouts');
        }

        return Transfer::create([
            'amount'      => (int) round($amountUsd * 100),
            'currency'    => 'usd',
            'destination' => $freelancer->stripe_account_id,
            'metadata' => [
                'panda_withdrawal_id' => $withdrawal->id,
                'panda_user_id'       => $freelancer->id,
            ],
        ], ['idempotency_key' => "panda_wd_{$withdrawal->id}"]);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  WEBHOOK — verify signature and return the event
     * ────────────────────────────────────────────────────────────────────── */
    public function verifyWebhook(string $payload, string $sigHeader): \Stripe\Event
    {
        $secret = config('services.stripe.webhook_secret');
        if (!$secret) {
            throw new RuntimeException('STRIPE_WEBHOOK_SECRET not configured');
        }
        return Webhook::constructEvent($payload, $sigHeader, $secret);
    }

    /* ──────────────────────────────────────────────────────────────────────
     *  Helpers
     * ────────────────────────────────────────────────────────────────────── */
    protected function assertConfigured(): void
    {
        if (!config('services.stripe.secret')) {
            throw new RuntimeException('STRIPE_SECRET not configured — set it in .env');
        }
    }
}
