<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->json('skills')->nullable();
            $table->enum('type', ['hourly', 'fixed'])->default('fixed');
            $table->enum('experience_level', ['entry', 'intermediate', 'expert'])->default('intermediate');
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->string('duration')->nullable();
            $table->enum('status', ['draft', 'open', 'in_progress', 'completed', 'cancelled', 'paused'])->default('open');
            $table->enum('visibility', ['public', 'invite_only'])->default('public');
            $table->string('location_requirement')->nullable();
            $table->json('attachments')->nullable();
            $table->integer('proposals_count')->default(0);
            $table->integer('views_count')->default(0);
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_urgent')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'created_at']);
            $table->index(['category_id', 'status']);
        });

        Schema::create('proposals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('job_postings')->cascadeOnDelete();
            $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();
            $table->text('cover_letter');
            $table->decimal('bid_amount', 12, 2);
            $table->string('bid_type')->default('fixed');
            $table->integer('estimated_duration')->nullable();
            $table->string('duration_unit')->default('days');
            $table->json('milestones')->nullable();
            $table->json('attachments')->nullable();
            $table->enum('status', ['pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn'])->default('pending');
            $table->boolean('is_ai_generated')->default(false);
            $table->integer('connects_used')->default(1);
            $table->timestamps();
            $table->unique(['job_id', 'freelancer_id']);
        });

        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_id')->constrained('job_postings');
            $table->foreignId('proposal_id')->constrained();
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('freelancer_id')->constrained('users');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('type', ['hourly', 'fixed'])->default('fixed');
            $table->decimal('amount', 12, 2);
            $table->decimal('escrow_amount', 12, 2)->default(0);
            $table->enum('status', ['pending', 'active', 'paused', 'completed', 'cancelled', 'disputed'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->timestamp('deadline_at')->nullable();
            $table->text('terms')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('milestones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->enum('status', ['pending', 'in_progress', 'submitted', 'approved', 'rejected', 'paid'])->default('pending');
            $table->timestamp('due_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('submission_notes')->nullable();
            $table->json('attachments')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->constrained();
            $table->foreignId('reviewer_id')->constrained('users');
            $table->foreignId('reviewee_id')->constrained('users');
            $table->decimal('rating', 3, 2);
            $table->text('comment')->nullable();
            $table->json('breakdown')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('milestones');
        Schema::dropIfExists('contracts');
        Schema::dropIfExists('proposals');
        Schema::dropIfExists('job_postings');
    }
};
