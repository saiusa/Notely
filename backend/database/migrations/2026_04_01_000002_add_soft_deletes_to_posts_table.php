<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            // Add updated_at for tracking edits
            $table->timestamp('updated_at')->nullable()->after('created_at');
            // Add deleted_at for soft deletes
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn(['updated_at', 'deleted_at']);
        });
    }
};
