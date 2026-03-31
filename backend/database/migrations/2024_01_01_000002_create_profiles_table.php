<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id('profile_id');
            $table->foreignId('user_id')->unique()->constrained('users', 'user_id')->cascadeOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('location')->nullable();
            $table->date('birthday')->nullable();
            $table->string('gender')->nullable();
            $table->text('description')->nullable();
            $table->string('profile_picture')->nullable();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
            $table->index(['location', 'gender']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
