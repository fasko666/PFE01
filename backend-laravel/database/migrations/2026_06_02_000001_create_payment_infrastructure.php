<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Payment infrastructure hardening.
 *
 *  - Adds platform_settings (admin-configurable commission rates, etc.)
 *  - Adds withdrawals (freelancer payout requests)
 *  - Adds idempotency_key + balance_after columns to transactions (ledger integrity)
 *  - Extends transaction.type enum with new commission/withdrawal types
 *  - Adds a `is_platform` flag to users + seeds the platform system account
 */
return new class extends Migration
{
    public function up(): void
    {
        // ─── 1. Platform settings (key/value, admin-configurable) ────────────
        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('description')->nullable();
            $table->string('group')->default('general')->index();
            $table->timestamps();
        });

        // Seed defaults
        DB::table('platform_settings')->insert([
            ['key' => 'fee.freelancer_pct',    'value' => '0.10', 'group' => 'fees', 'description' => 'Service fee deducted from freelancer payouts (e.g. 0.10 = 10%)'],
            ['key' => 'fee.client_pct',        'value' => '0.05', 'group' => 'fees', 'description' => 'Service fee charged to client on top of contract amount (e.g. 0.05 = 5%)'],
            ['key' => 'fee.contract_init',     'value' => '0.99', 'group' => 'fees', 'description' => 'One-time contract initiation fee charged to client (USD flat)'],
            ['key' => 'fee.withdrawal_flat',   'value' => '2.00', 'group' => 'fees', 'description' => 'Flat withdrawal fee to bank (USD)'],
            ['key' => 'fee.deposit_pct',       'value' => '0.029','group' => 'fees', 'description' => 'Deposit processing fee (Stripe-style)'],
            ['key' => 'fee.deposit_flat',      'value' => '0.30', 'group' => 'fees', 'description' => 'Deposit processing flat fee (USD)'],
            ['key' => 'withdrawal.min',        'value' => '20.00','group' => 'withdrawals', 'description' => 'Minimum withdrawal amount (USD)'],
            ['key' => 'withdrawal.requires_approval', 'value' => '1', 'group' => 'withdrawals', 'description' => 'Whether admin approval is required for withdrawals (1=yes, 0=auto)'],
        ]);

        // ─── 2. Platform system user (single row) ────────────────────────────
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_platform')->default(false)->after('is_active')->index();
        });

        // Create the platform system user + its wallet now so transactions can credit it
        $platformId = DB::table('users')->insertGetId([
            'name'        => 'PANDA Platform',
            'username'    => '__platform__',
            'email'       => 'platform@panda.internal',
            'password'    => bcrypt(str()->random(64)), // unloggable
            'role'        => 'admin',
            'is_platform' => true,
            'is_active'   => false, // cannot log in
            'is_verified' => true,
            'email_verified_at' => now(),
            'created_at'  => now(),
            'updated_at'  => now(),
        ]);

        DB::table('wallets')->insert([
            'user_id'    => $platformId,
            'balance'    => 0,
            'currency'   => 'USD',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ─── 3. Withdrawals (freelancer payout requests) ─────────────────────
        Schema::create('withdrawals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('wallet_id')->constrained();
            $table->decimal('amount',  12, 2);             // requested
            $table->decimal('fee',     12, 2)->default(0); // platform fee
            $table->decimal('net',     12, 2);             // amount - fee, sent to user
            $table->string('currency', 8)->default('USD');
            $table->enum('method', ['bank', 'paypal', 'wise', 'stripe', 'crypto'])->default('bank');
            $table->json('payout_details')->nullable();    // bank acct, paypal email, etc. (encrypt at rest in prod)
            $table->enum('status', ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'])->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->string('rejection_reason')->nullable();
            $table->string('external_ref')->nullable();    // Stripe payout id, etc.
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });

        // ─── 4. Transactions: extend for production safety ───────────────────
        Schema::table('transactions', function (Blueprint $table) {
            // Idempotency: caller can pass a UUID; duplicates rejected at DB level
            $table->string('idempotency_key')->nullable()->after('reference');
            // Running balance after this transaction (immutable audit trail)
            $table->decimal('balance_after', 12, 2)->nullable()->after('fee');
            // Direct link to a withdrawal record when applicable
            $table->foreignId('withdrawal_id')->nullable()->after('milestone_id')->constrained()->nullOnDelete();
            // Counterparty: the OTHER side of a money movement (eg client paying freelancer)
            $table->foreignId('counterparty_user_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            // Direction is explicit, decoupled from type
            $table->enum('direction', ['in', 'out'])->default('in')->after('amount');

            $table->unique('idempotency_key');
            $table->index(['user_id', 'created_at']);
            $table->index(['contract_id', 'milestone_id']);
        });

        // Add 'commission' and richer type vocabulary (MySQL-safe: drop & recreate enum
        // is non-trivial in MySQL too, so we leave the enum and use 'fee' for commissions
        // alongside the existing types. The existing `type` enum already supports:
        // ['credit', 'debit', 'escrow', 'release', 'refund', 'withdrawal', 'fee']
        // which is sufficient — we standardize meaning in the LedgerService.)
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropUnique(['idempotency_key']);
            $table->dropIndex(['user_id', 'created_at']);
            $table->dropIndex(['contract_id', 'milestone_id']);
            $table->dropConstrainedForeignId('withdrawal_id');
            $table->dropConstrainedForeignId('counterparty_user_id');
            $table->dropColumn(['idempotency_key', 'balance_after', 'direction']);
        });

        Schema::dropIfExists('withdrawals');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_platform');
        });

        Schema::dropIfExists('platform_settings');
    }
};
