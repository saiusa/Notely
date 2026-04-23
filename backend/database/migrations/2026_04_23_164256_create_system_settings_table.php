<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();

            // ── Feature flags ──────────────────────────────────────────────
            $table->boolean('maintenance_mode')->default(false)
                ->comment('When true, non-admin users see a maintenance screen');

            $table->boolean('disable_registrations')->default(false)
                ->comment('When true, the /register endpoint rejects new sign-ups');

            // ── Global content ─────────────────────────────────────────────
            $table->text('global_announcement')->nullable()
                ->comment('System-wide banner message shown to all logged-in users');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};
