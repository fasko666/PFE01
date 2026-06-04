<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stripe-specific infrastructure:
 *  - stripe_webhook_events: idempotency log for all incoming webhooks
 *  - users.stripe_customer_id: for Checkout / Subscriptions
 *  - users.stripe_account_id + status fields: for Stripe Connect (payouts)
 *  - withdrawals.stripe_transfer_id: link payouts back to Stripe transfers
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stripe_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('stripe_event_id')->unique();   // evt_...
            $table->string('type')->index();                // payment_intent.succeeded, etc.
            $table->json('payload');                        // full event for replay/debug
            $table->enum('status', ['received', 'processed', 'failed', 'ignored'])->default('received')->index();
            $table->string('processing_error')->nullable();
            $table->integer('attempts')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            // Used for client-side: Checkout sessions, subscriptions
            $table->string('stripe_customer_id')->nullable()->after('google_id')->index();

            // Used for freelancer-side: Connect payouts
            $table->string('stripe_account_id')->nullable()->after('stripe_customer_id')->index();
            $table->enum('stripe_account_status', [
                'none', 'pending', 'restricted', 'active', 'disabled'
            ])->default('none')->after('stripe_account_id');
            $table->boolean('stripe_charges_enabled')->default(false)->after('stripe_account_status');
            $table->boolean('stripe_payouts_enabled')->default(false)->after('stripe_charges_enabled');
            $table->timestamp('stripe_onboarded_at')->nullable()->after('stripe_payouts_enabled');
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->string('stripe_transfer_id')->nullable()->after('external_ref')->index();
            $table->string('stripe_payout_id')->nullable()->after('stripe_transfer_id')->index();
        });
    }

    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropColumn(['stripe_transfer_id', 'stripe_payout_id']);
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_customer_id', 'stripe_account_id', 'stripe_account_status',
                'stripe_charges_enabled', 'stripe_payouts_enabled', 'stripe_onboarded_at',
            ]);
        });
        Schema::dropIfExists('stripe_webhook_events');
    }
};
