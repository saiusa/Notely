<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn(['icon', 'color', 'description']);
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->timestamp('updated_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->string('icon')->nullable();
            $table->string('color')->nullable();
            $table->text('description')->nullable();
        });

        Schema::table('communities', function (Blueprint $table) {
            $table->dropColumn('updated_at');
        });
    }
};
