<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Quick-save bookmarks: distinct from named lists
        Schema::create('saved_freelancers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();         // saver
            $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'freelancer_id']);
        });

        // Named lists ("React devs Q3", "Design candidates", …)
        Schema::create('talent_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->string('description', 500)->nullable();
            $table->timestamps();
            $table->index(['user_id', 'name']);
        });

        // Pivot
        Schema::create('talent_list_freelancers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('talent_list_id')->constrained()->cascadeOnDelete();
            $table->foreignId('freelancer_id')->constrained('users')->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
            $table->unique(['talent_list_id', 'freelancer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('talent_list_freelancers');
        Schema::dropIfExists('talent_lists');
        Schema::dropIfExists('saved_freelancers');
    }
};
