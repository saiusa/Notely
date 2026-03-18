<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_members', function (Blueprint $table) {
            $table->id('id');
            $table->foreignId('user_id')->constrained('users', 'user_id')->cascadeOnDelete();
            $table->foreignId('community_id')->constrained('communities', 'community_id')->cascadeOnDelete();
            $table->timestamp('joined_at')->useCurrent();
            $table->unique(['user_id', 'community_id']);
            $table->index(['community_id', 'joined_at']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_members');
    }
};
