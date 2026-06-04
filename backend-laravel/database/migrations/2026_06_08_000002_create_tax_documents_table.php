<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tax_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('form_type', ['w9', 'w8ben', 'vat'])->index();
            $table->string('country', 2);
            $table->string('legal_name');
            $table->string('tax_id_last4', 8)->nullable();           // never store full TIN at rest
            $table->string('address_line1');
            $table->string('address_line2')->nullable();
            $table->string('city');
            $table->string('state_region')->nullable();
            $table->string('postal_code');
            $table->json('form_payload')->nullable();                // additional form-specific fields
            $table->string('signed_pdf_path')->nullable();           // generated when approved
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('submitted')->index();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tax_documents');
    }
};
