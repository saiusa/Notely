<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Seed the admin user into the database.
     * Uses firstOrCreate to ensure idempotency (safe to run multiple times).
     */
    public function run(): void
    {
        // Create or retrieve the admin user
        // Searches by email, creates if doesn't exist
        $admin = User::firstOrCreate(
            ['email' => 'admin@notely.com'],
            [
                'username' => 'notely.admin',
                'password' => Hash::make('admin123'),
            ]
        );

        // Set is_admin to true (not in $fillable, so update separately)
        $admin->update(['is_admin' => true]);

        $this->command->info('✅ Admin user created/verified: admin@notely.com');
        $this->command->info('📧 Email: admin@notely.com');
        $this->command->info('👤 Username: notely.admin');
        $this->command->info('🔐 Password: admin123');
    }
}
