<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notification_id');
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->enum('type', ['like', 'comment', 'community']);
            $table->unsignedBigInteger('reference_id');
            $table->boolean('is_read')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->index(['user_id', 'is_read', 'created_at']);
            $table->index(['type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
