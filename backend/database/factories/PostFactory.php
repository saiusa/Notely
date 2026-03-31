<?php

namespace Database\Factories;

use App\Models\Mood;
use App\Models\Post;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
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
            'content' => fake()->paragraph(),
            'image' => fake()->optional()->imageUrl(),
            'mood_id' => Mood::factory(),
            'privacy' => fake()->randomElement(['public', 'private']),
            'allow_comments' => fake()->boolean(85),
            'is_anonymous' => fake()->boolean(15),
            'created_at' => fake()->dateTimeBetween('-6 months', 'now'),
        ];
    }
}
