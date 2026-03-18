<?php

namespace Database\Factories;

use App\Models\PasswordReset;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PasswordReset>
 */
class PasswordResetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'email' => fake()->safeEmail(),
            'code' => (string) fake()->numberBetween(100000, 999999),
            'expires_at' => fake()->dateTimeBetween('now', '+1 day'),
        ];
    }
}
