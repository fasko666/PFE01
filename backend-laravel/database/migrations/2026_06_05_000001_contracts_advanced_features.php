<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // archived flag
        Schema::table('contracts', function (Blueprint $table) {
            if (! Schema::hasColumn('contracts', 'archived_at')) {
                $table->timestamp('archived_at')->nullable()->after('ended_at')->index();
            }
        });

        // Contract files (with versioning via parent_id chain)
        Schema::create('contract_files', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uploader_id')->constrained('users');
            $table->foreignId('parent_id')->nullable()->constrained('contract_files')->nullOnDelete();
            $table->string('original_name');
            $table->string('stored_path');     // disk path
            $table->string('mime_type', 100)->nullable();
            $table->unsignedBigInteger('size_bytes')->default(0);
            $table->unsignedInteger('version')->default(1);
            $table->string('description')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['contract_id', 'version']);
        });

        // Contract activity feed (append-only)
        Schema::create('contract_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('type', 64);        // e.g. milestone.created, file.uploaded, status.changed
            $table->json('data')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['contract_id', 'created_at']);
            $table->index('type');
        });

        // Time logs
        Schema::create('time_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained();
            $table->timestamp('started_at');
            $table->timestamp('ended_at')->nullable();   // null = running
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->string('description', 500)->nullable();
            $table->string('screenshot_url')->nullable(); // optional screenshot path
            $table->timestamps();
            $table->index(['contract_id', 'user_id', 'started_at']);
        });

        // Contract extensions (deadline / budget / milestone add requests)
        Schema::create('contract_extensions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->foreignId('requested_by')->constrained('users');
            $table->timestamp('new_deadline')->nullable();
            $table->decimal('additional_budget', 12, 2)->default(0);
            $table->json('new_milestones')->nullable();    // array of {title, amount, due_at}
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'accepted', 'rejected'])->default('pending');
            $table->foreignId('responded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('responded_at')->nullable();
            $table->text('response_notes')->nullable();
            $table->timestamps();
            $table->index(['contract_id', 'status']);
        });

        // Add screenshot/extension fields to milestones for completeness
        Schema::table('milestones', function (Blueprint $table) {
            if (! Schema::hasColumn('milestones', 'submitted_by')) {
                $table->foreignId('submitted_by')->nullable()->after('submission_notes')->constrained('users')->nullOnDelete();
            }
            if (! Schema::hasColumn('milestones', 'rejection_reason')) {
                $table->text('rejection_reason')->nullable()->after('submitted_by');
            }
        });
    }

    public function down(): void
    {
        Schema::table('milestones', function (Blueprint $table) {
            if (Schema::hasColumn('milestones', 'submitted_by'))     $table->dropConstrainedForeignId('submitted_by');
            if (Schema::hasColumn('milestones', 'rejection_reason')) $table->dropColumn('rejection_reason');
        });
        Schema::dropIfExists('contract_extensions');
        Schema::dropIfExists('time_logs');
        Schema::dropIfExists('contract_activities');
        Schema::dropIfExists('contract_files');
        Schema::table('contracts', function (Blueprint $table) {
            if (Schema::hasColumn('contracts', 'archived_at')) $table->dropColumn('archived_at');
        });
    }
};
