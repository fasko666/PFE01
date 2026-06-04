<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (! Schema::hasColumn('contracts', 'hourly_rate')) {
                $table->decimal('hourly_rate', 10, 2)->nullable()->after('amount');
            }
            if (! Schema::hasColumn('contracts', 'weekly_limit')) {
                $table->unsignedInteger('weekly_limit')->nullable()->after('hourly_rate');
            }
            if (! Schema::hasColumn('contracts', 'auto_invoice_at')) {
                $table->timestamp('auto_invoice_at')->nullable()->after('weekly_limit')->index();
            }
            if (! Schema::hasColumn('contracts', 'billing_status')) {
                $table->enum('billing_status', ['active', 'paused', 'closed'])->default('active')->after('auto_invoice_at');
            }
        });

        Schema::create('weekly_invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('freelancer_id')->constrained('users');
            $table->date('week_start');
            $table->date('week_end');
            $table->unsignedInteger('seconds_worked')->default(0);
            $table->decimal('hours_worked', 8, 2)->default(0);
            $table->decimal('hourly_rate', 10, 2);
            $table->decimal('gross_amount', 12, 2)->default(0);
            $table->decimal('commission', 12, 2)->default(0);
            $table->decimal('net_to_freelancer', 12, 2)->default(0);
            $table->enum('status', ['pending', 'paid', 'failed', 'cancelled'])->default('pending');
            $table->text('failure_reason')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->string('idempotency_key', 64)->unique();
            $table->timestamps();

            $table->unique(['contract_id', 'week_start']);    // one invoice per contract per week
            $table->index(['freelancer_id', 'status']);
            $table->index(['client_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('weekly_invoices');
        Schema::table('contracts', function (Blueprint $table) {
            foreach (['hourly_rate', 'weekly_limit', 'auto_invoice_at', 'billing_status'] as $col) {
                if (Schema::hasColumn('contracts', $col)) $table->dropColumn($col);
            }
        });
    }
};
