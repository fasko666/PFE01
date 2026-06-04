<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Re-creates the `subscriptions` table with a Cashier-compatible shape.
 *
 * We chose NOT to install laravel/cashier because it pins stripe/stripe-php to
 * ^17 while this project already uses ^20 (required by our existing escrow +
 * Stripe Connect code). Downgrading would break 4 passing Stripe tests +
 * StripeService's deposit/payout/refund flows.
 *
 * The schema below matches Cashier 16's so that future migration to Cashier
 * (once it supports stripe-php ^20) is a model-class swap, not a data move.
 *
 * Connects are NOT here — they live on `users.connects_balance` (added in the
 * preceding migration). Subscriptions are paid plans; Connects are a counter.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');                      // 'default' for the primary plan; allows multiple in future
            $table->string('stripe_id')->unique();       // sub_…
            $table->string('stripe_status');             // active / past_due / canceled / incomplete / trialing
            $table->string('stripe_price')->nullable();  // price_… of the primary item
            $table->string('plan_slug');                 // internal: free | freelancer_plus | client_plus | business
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('ends_at')->nullable();    // set when canceled-at-period-end
            $table->timestamps();

            $table->index(['user_id', 'stripe_status']);
        });

        Schema::create('subscription_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->cascadeOnDelete();
            $table->string('stripe_id')->unique();
            $table->string('stripe_product');
            $table->string('stripe_price');
            $table->unsignedInteger('quantity')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_items');
        Schema::dropIfExists('subscriptions');
    }
};
