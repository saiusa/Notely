<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Notification>
 */
class NotificationFactory extends Factory
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
            'type' => fake()->randomElement(['like', 'comment', 'community']),
            'reference_id' => fake()->numberBetween(1, 1000),
            'is_read' => fake()->boolean(35),
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
