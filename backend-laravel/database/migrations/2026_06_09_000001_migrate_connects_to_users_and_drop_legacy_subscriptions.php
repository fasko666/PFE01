<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cashier migration prep.
 *
 *   1. Add `connects_balance` to `users` (single source of truth going forward).
 *   2. Copy existing `subscriptions.connects_balance` into `users.connects_balance`.
 *   3. Drop the legacy `subscriptions` table so Cashier can create its own.
 *
 * The legacy `Subscription` model only holds `connects_balance` + denormalized
 * Stripe state. After this migration runs, Cashier owns all paid-plan state;
 * Connects live directly on the user (much simpler — Connects are not a paid
 * subscription, they are a per-user counter).
 */
return new class extends Migration
{
    public function up(): void
    {
        // 1. Add the new column
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'connects_balance')) {
                $table->unsignedInteger('connects_balance')->default(10)->after('phone_verified');
            }
        });

        // 2. Backfill from legacy subscriptions (if any)
        if (Schema::hasTable('subscriptions') && Schema::hasColumn('subscriptions', 'connects_balance')) {
            $rows = DB::table('subscriptions')->select('user_id', 'connects_balance')->get();
            foreach ($rows as $r) {
                DB::table('users')->where('id', $r->user_id)->update([
                    'connects_balance' => max(0, (int) $r->connects_balance),
                ]);
            }
        }

        // 3. Drop the legacy table so Cashier can install its own `subscriptions`
        Schema::dropIfExists('subscriptions');
    }

    public function down(): void
    {
        // Recreate the legacy table shape exactly as it was originally
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('plan', ['free', 'freelancer_plus', 'business', 'enterprise'])->default('free');
            $table->string('stripe_subscription_id')->nullable();
            $table->integer('connects_balance')->default(10);
            $table->decimal('monthly_fee', 8, 2)->default(0);
            $table->enum('status', ['active', 'cancelled', 'expired', 'trial'])->default('active');
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamps();
        });

        // Backfill from users → legacy table
        DB::table('users')->select('id', 'connects_balance')->orderBy('id')->each(function ($u) {
            DB::table('subscriptions')->insert([
                'user_id'          => $u->id,
                'plan'             => 'free',
                'connects_balance' => $u->connects_balance ?? 10,
                'status'           => 'active',
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'connects_balance')) {
                $table->dropColumn('connects_balance');
            }
        });
    }
};
