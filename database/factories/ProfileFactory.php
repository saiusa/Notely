<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
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
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'location' => fake()->optional()->city(),
            'birthday' => fake()->optional()->date(),
            'gender' => fake()->optional()->randomElement(['male', 'female', 'other']),
            'description' => fake()->optional()->sentence(),
            'profile_picture' => fake()->optional()->imageUrl(),
            'updated_at' => now(),
        ];
    }
}
