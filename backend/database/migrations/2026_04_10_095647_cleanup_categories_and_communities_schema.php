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
            $columnsToDrop = array_filter(
                ['icon', 'color', 'description'],
                fn($col) => Schema::hasColumn('categories', $col)
            );
            if (!empty($columnsToDrop)) {
                $table->dropColumn(array_values($columnsToDrop));
            }
        });

        if (Schema::hasTable('communities') && !Schema::hasColumn('communities', 'updated_at')) {
            Schema::table('communities', function (Blueprint $table) {
                $table->timestamp('updated_at')->useCurrent();
            });
        }
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
