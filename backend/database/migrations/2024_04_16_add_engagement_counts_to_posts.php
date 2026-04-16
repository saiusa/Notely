<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * This migration adds denormalized count columns to optimize the trending algorithm.
     * These are updated via database triggers or event listeners.
     * 
     * Without these columns, the explore feed would need to calculate counts on every query,
     * which becomes slow as your post volume grows.
     */
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Denormalized counters for trending algorithm
            // These are updated via events/listeners when records are created/deleted
            $table->bigInteger('likes_count')->default(0)->index();
            $table->bigInteger('comments_count')->default(0)->index();
        });

        // Alternative: Calculate initial values from existing data
        // Uncomment if migrating existing posts:
        /*
        DB::statement('UPDATE posts SET likes_count = (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.post_id)');
        DB::statement('UPDATE posts SET comments_count = (SELECT COUNT(*) FROM comments WHERE comments.post_id = posts.post_id)');
        */
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['likes_count', 'comments_count']);
        });
    }
};
