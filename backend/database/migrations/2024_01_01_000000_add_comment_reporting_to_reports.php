<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->unsignedBigInteger('comment_id')->nullable()->after('post_id');
            $table->string('report_type')->default('post')->after('comment_id'); // 'post' or 'comment'
            $table->text('description')->nullable()->after('reason');
            
            // Add foreign key constraint for comment_id if comments table exists
            $table->foreign('comment_id')
                ->references('comment_id')
                ->on('comments')
                ->onDelete('cascade');
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
