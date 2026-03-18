<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id('post_id');
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->unsignedBigInteger('community_id')->nullable();
            $table->text('content');
            $table->string('image')->nullable();
            $table->foreignId('mood_id')->constrained('moods', 'mood_id')->cascadeOnDelete();
            $table->enum('privacy', ['public', 'private'])->default('public');
            $table->boolean('allow_comments')->default(true);
            $table->boolean('is_anonymous')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'created_at']);
            $table->index(['community_id', 'created_at']);
            $table->index('privacy');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
