<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            if (! Schema::hasColumn('milestones', 'created_by')) {
                $table->foreignId('created_by')->nullable()->after('contract_id')
                    ->constrained('users')->nullOnDelete();
            }
            $table->index(['contract_id', 'status'], 'milestones_contract_status_idx');
            $table->index('created_by', 'milestones_creator_idx');
        });
    }

    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            $table->dropIndex('milestones_contract_status_idx');
            $table->dropIndex('milestones_creator_idx');
            if (Schema::hasColumn('milestones', 'created_by')) {
                $table->dropConstrainedForeignId('created_by');
            }
        });
    }
};
