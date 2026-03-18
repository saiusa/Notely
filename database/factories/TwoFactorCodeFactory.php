<?php

namespace Database\Factories;

use App\Models\TwoFactorCode;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TwoFactorCode>
 */
class TwoFactorCodeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'code' => (string) fake()->numberBetween(100000, 999999),
            'expires_at' => fake()->dateTimeBetween('now', '+1 day'),
        ];
    }
}
