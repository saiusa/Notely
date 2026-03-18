<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityMember>
 */
class CommunityMemberFactory extends Factory
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
            'community_id' => Community::factory(),
            'joined_at' => fake()->dateTimeBetween('-1 year', 'now'),
        ];
    }
}
