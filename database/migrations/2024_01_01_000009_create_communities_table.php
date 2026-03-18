<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('communities', function (Blueprint $table) {
            $table->id('community_id');
            $table->string('name');
            $table->text('description');
            $table->string('image')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index('name');
            $table->index('created_at');
        });

        Schema::table('posts', function (Blueprint $table): void {
            $table->foreign('community_id')
                ->references('community_id')
                ->on('communities')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table): void {
            $table->dropForeign(['community_id']);
        });

        Schema::dropIfExists('communities');
    }
};
