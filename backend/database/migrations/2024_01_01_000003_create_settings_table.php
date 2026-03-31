<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id('setting_id');
            $table->foreignId('user_id')->unique()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->enum('default_post_privacy', ['public', 'private'])->default('public');
            $table->boolean('hide_comments')->default(false);
            $table->boolean('show_reaction_counts')->default(true);
            $table->boolean('notify_likes')->default(true);
            $table->boolean('notify_comments')->default(true);
            $table->boolean('email_notifications')->default(true);
            $table->boolean('two_factor_enabled')->default(false);
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->index(['default_post_privacy', 'two_factor_enabled']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
