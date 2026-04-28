<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('reports')) {
            return;
        }

        Schema::table('reports', function (Blueprint $table) {
            if (!Schema::hasColumn('reports', 'comment_id')) {
                $table->unsignedBigInteger('comment_id')->nullable()->after('post_id');
            }
            if (!Schema::hasColumn('reports', 'report_type')) {
                $table->string('report_type')->default('post')->after('comment_id');
            }
            if (!Schema::hasColumn('reports', 'description')) {
                $table->text('description')->nullable()->after('reason');
            }

            // Add foreign key only if comment_id column exists and comments table exists
            if (Schema::hasColumn('reports', 'comment_id') && Schema::hasTable('comments')) {
                $table->foreign('comment_id')
                    ->references('comment_id')
                    ->on('comments')
                    ->onDelete('cascade');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropForeign(['comment_id']);
            $table->dropColumn(['comment_id', 'report_type', 'description']);
        });
    }
};
