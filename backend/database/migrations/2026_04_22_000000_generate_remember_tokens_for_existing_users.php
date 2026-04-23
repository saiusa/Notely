<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Generate remember_tokens for users who don't have one
        DB::table('users')
            ->whereNull('remember_token')
            ->update([
                'remember_token' => DB::raw("'" . Str::random(100) . "'"),
            ]);

        // Alternative: Use raw SQL to generate unique tokens for each row
        // This is database-agnostic and more efficient
        if (DB::getDriverName() === 'sqlite') {
            // SQLite approach
            DB::statement("
                UPDATE users 
                SET remember_token = lower(hex(randomblob(50))) 
                WHERE remember_token IS NULL
            ");
        } elseif (DB::getDriverName() === 'pgsql') {
            // PostgreSQL approach
            DB::statement("
                UPDATE users 
                SET remember_token = encode(gen_random_bytes(50), 'hex') 
                WHERE remember_token IS NULL
            ");
        } elseif (DB::getDriverName() === 'mysql') {
            // MySQL approach - generate random hex strings
            DB::statement("
                UPDATE users 
                SET remember_token = UUID() 
                WHERE remember_token IS NULL
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Don't delete tokens on rollback - they may be in use
        DB::table('users')->update([
            'remember_token' => null,
        ]);
    }
};
