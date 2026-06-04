<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('seller_id')->constrained('users');                  // freelancer offering the service
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->json('tier_basic')->nullable();      // { price, delivery_days, revisions, features:[] }
            $table->json('tier_standard')->nullable();
            $table->json('tier_premium')->nullable();
            $table->json('faq')->nullable();             // [{ q, a }, …]
            $table->json('skills')->nullable();
            $table->enum('status', ['draft', 'pending_review', 'published', 'rejected', 'suspended'])->default('draft')->index();
            $table->unsignedInteger('views_count')->default(0);
            $table->unsignedInteger('orders_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->unsignedInteger('reviews_count')->default(0);
            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('moderated_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['status', 'created_at']);
        });

        Schema::create('catalog_project_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_project_id')->constrained()->cascadeOnDelete();
            $table->string('image_url');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('catalog_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_project_id')->constrained();
            $table->foreignId('buyer_id')->constrained('users');
            $table->foreignId('seller_id')->constrained('users');
            $table->enum('tier', ['basic', 'standard', 'premium']);
            $table->decimal('price', 12, 2);
            $table->unsignedInteger('delivery_days');
            $table->unsignedInteger('revisions_allowed');
            $table->text('requirements')->nullable();
            $table->enum('status', ['pending_payment', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed'])
                ->default('pending_payment')->index();
            $table->string('stripe_session_id')->nullable()->unique();
            $table->foreignId('contract_id')->nullable()->constrained()->nullOnDelete();   // contract auto-created on payment
            $table->foreignId('conversation_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->index(['buyer_id', 'status']);
            $table->index(['seller_id', 'status']);
        });

        Schema::create('catalog_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catalog_project_id')->constrained();
            $table->foreignId('catalog_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('reviewer_id')->constrained('users');
            $table->decimal('rating', 3, 2);
            $table->text('comment')->nullable();
            $table->timestamps();
            $table->unique('catalog_order_id');                     // one review per order
        });

        Schema::create('saved_catalog_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('catalog_project_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'catalog_project_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('saved_catalog_projects');
        Schema::dropIfExists('catalog_reviews');
        Schema::dropIfExists('catalog_orders');
        Schema::dropIfExists('catalog_project_images');
        Schema::dropIfExists('catalog_projects');
    }
};
