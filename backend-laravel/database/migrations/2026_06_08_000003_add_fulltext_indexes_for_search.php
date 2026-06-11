<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * MySQL FULLTEXT indexes for global search (Feature 2). Skipped on non-MySQL
 * drivers (MySQL tests fall back to LIKE %x% which the controller handles).
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') return;

        $stmts = [
            'ALTER TABLE job_postings        ADD FULLTEXT job_postings_search_idx (title, description)',
            'ALTER TABLE users               ADD FULLTEXT users_search_idx (name, username)',
            'ALTER TABLE freelancer_profiles ADD FULLTEXT freelancer_profiles_search_idx (title, bio)',
            'ALTER TABLE contracts           ADD FULLTEXT contracts_search_idx (title, description)',
            'ALTER TABLE messages            ADD FULLTEXT messages_search_idx (body)',
        ];
        foreach ($stmts as $sql) {
            try { DB::statement($sql); }
            catch (\Throwable $e) { /* index may already exist on re-run */ }
        }
    }

    public function down(): void
    {
        if (DB::connection()->getDriverName() !== 'mysql') return;
        foreach ([
            'ALTER TABLE job_postings        DROP INDEX job_postings_search_idx',
            'ALTER TABLE users               DROP INDEX users_search_idx',
            'ALTER TABLE freelancer_profiles DROP INDEX freelancer_profiles_search_idx',
            'ALTER TABLE contracts           DROP INDEX contracts_search_idx',
            'ALTER TABLE messages            DROP INDEX messages_search_idx',
        ] as $sql) {
            try { DB::statement($sql); } catch (\Throwable $e) {}
        }
    }
};
