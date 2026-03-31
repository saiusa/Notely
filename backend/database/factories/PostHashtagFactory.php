<?php

namespace Database\Factories;

use App\Models\Hashtag;
use App\Models\Post;
use App\Models\PostHashtag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PostHashtag>
 */
class PostHashtagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'post_id' => Post::factory(),
            'hashtag_id' => Hashtag::factory(),
        ];
    }
}
