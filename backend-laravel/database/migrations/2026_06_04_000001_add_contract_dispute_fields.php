<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Contracts module — fields required by the production state machine:
 *   dispute_reason / disputed_at / dispute_opened_by  → who and why
 *   resolved_at / resolved_by / resolution_outcome    → audit trail for admin actions
 *   cancellation_reason / cancelled_by                → matches dispute audit
 *   completed_by                                       → who clicked Complete
 *
 * Indexes accelerate the per-user list queries (the GET /contracts/my/* endpoints).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            if (! Schema::hasColumn('contracts', 'dispute_reason')) {
                $table->text('dispute_reason')->nullable()->after('terms');
            }
            if (! Schema::hasColumn('contracts', 'disputed_at')) {
                $table->timestamp('disputed_at')->nullable()->after('dispute_reason');
            }
            if (! Schema::hasColumn('contracts', 'dispute_opened_by')) {
                $table->foreignId('dispute_opened_by')->nullable()->after('disputed_at')
                    ->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('contracts', 'resolved_at')) {
                $table->timestamp('resolved_at')->nullable()->after('dispute_opened_by');
            }
            if (! Schema::hasColumn('contracts', 'resolved_by')) {
                $table->foreignId('resolved_by')->nullable()->after('resolved_at')
                    ->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('contracts', 'resolution_outcome')) {
                $table->string('resolution_outcome', 32)->nullable()->after('resolved_by');
            }
            if (! Schema::hasColumn('contracts', 'cancellation_reason')) {
                $table->text('cancellation_reason')->nullable()->after('resolution_outcome');
            }
            if (! Schema::hasColumn('contracts', 'cancelled_by')) {
                $table->foreignId('cancelled_by')->nullable()->after('cancellation_reason')
                    ->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('contracts', 'completed_by')) {
                $table->foreignId('completed_by')->nullable()->after('cancelled_by')
                    ->constrained('users')->nullOnDelete();
            }

            $table->index(['status', 'client_id'],     'contracts_status_client_idx');
            $table->index(['status', 'freelancer_id'], 'contracts_status_freelancer_idx');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropIndex('contracts_status_client_idx');
            $table->dropIndex('contracts_status_freelancer_idx');

            foreach (['dispute_opened_by', 'resolved_by', 'cancelled_by', 'completed_by'] as $fk) {
                if (Schema::hasColumn('contracts', $fk)) {
                    $table->dropConstrainedForeignId($fk);
                }
            }
            foreach (['dispute_reason', 'disputed_at', 'resolved_at', 'resolution_outcome', 'cancellation_reason'] as $col) {
                if (Schema::hasColumn('contracts', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
