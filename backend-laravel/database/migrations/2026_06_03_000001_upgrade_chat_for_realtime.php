<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Production chat upgrade:
 *  - messages: edited_at, delivered_at, hot-path indexes
 *  - message_reactions: emoji reactions (one per user per emoji per message)
 *  - users: index on (is_online, last_seen_at) for presence list lookups
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            if (! Schema::hasColumn('messages', 'edited_at')) {
                $table->timestamp('edited_at')->nullable()->after('read_at');
            }
            if (! Schema::hasColumn('messages', 'delivered_at')) {
                $table->timestamp('delivered_at')->nullable()->after('edited_at');
            }
            // Hot path: listing a conversation's messages by created_at desc with pagination
            $table->index(['conversation_id', 'created_at'], 'messages_conv_created_idx');
            // Hot path: counting unread per conversation per user
            $table->index(['conversation_id', 'sender_id', 'is_read'], 'messages_conv_sender_read_idx');
        });

        Schema::create('message_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('emoji', 16);
            $table->timestamps();

            // One reaction per (message, user, emoji) — toggling is delete+insert
            $table->unique(['message_id', 'user_id', 'emoji']);
            $table->index(['message_id', 'emoji']);
        });

        Schema::table('users', function (Blueprint $table) {
            // Speeds up "who is online" lookups for the contact list
            $table->index(['is_online', 'last_seen_at'], 'users_presence_idx');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_presence_idx');
        });

        Schema::dropIfExists('message_reactions');

        Schema::table('messages', function (Blueprint $table) {
            $table->dropIndex('messages_conv_created_idx');
            $table->dropIndex('messages_conv_sender_read_idx');
            $table->dropColumn(['edited_at', 'delivered_at']);
        });
    }
};
