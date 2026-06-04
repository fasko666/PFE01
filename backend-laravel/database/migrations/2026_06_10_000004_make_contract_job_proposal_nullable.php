<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Catalog orders create contracts directly (no job_postings/proposals row),
 * so contracts.job_id and contracts.proposal_id must be nullable. The
 * original migration set them NOT NULL.
 *
 * Laravel 11+ supports ->change() natively for SQLite, MySQL, and PostgreSQL
 * without requiring doctrine/dbal — the framework rebuilds the table
 * internally on SQLite, preserving all other column attributes.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->unsignedBigInteger('job_id')->nullable()->change();
            $table->unsignedBigInteger('proposal_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Re-tightening would fail on any catalog-order contracts already in the
        // table; intentionally a no-op.
    }
};
