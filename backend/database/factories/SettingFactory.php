<?php

namespace Database\Factories;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
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
            'default_post_privacy' => fake()->randomElement(['public', 'private']),
            'hide_comments' => fake()->boolean(20),
            'show_reaction_counts' => fake()->boolean(80),
            'notify_likes' => fake()->boolean(80),
            'notify_comments' => fake()->boolean(80),
            'email_notifications' => fake()->boolean(80),
            'two_factor_enabled' => fake()->boolean(20),
            'updated_at' => now(),
        ];
    }
}
