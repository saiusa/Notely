<?php

namespace Database\Seeders;

use App\Models\Mood;
use Illuminate\Database\Seeder;

class MoodSeeder extends Seeder
{
    public function run(): void
    {
        $moods = [
            ['mood_id' => 1, 'name' => 'Happy', 'color' => '#FFF4CC'],
            ['mood_id' => 2, 'name' => 'Calm', 'color' => '#E6F4F1'],
            ['mood_id' => 3, 'name' => 'Sad', 'color' => '#E8F0FE'],
            ['mood_id' => 4, 'name' => 'Angry', 'color' => '#FFE5E5'],
            ['mood_id' => 5, 'name' => 'Anxious', 'color' => '#F3E8FF'],
            ['mood_id' => 6, 'name' => 'Reflective', 'color' => '#ECECEC'],
            ['mood_id' => 7, 'name' => 'Grateful', 'color' => '#E8F8F0'],
            ['mood_id' => 8, 'name' => 'Tired', 'color' => '#E9E6F8'],
        ];

        foreach ($moods as $mood) {
            Mood::updateOrCreate(
                ['mood_id' => $mood['mood_id']],
                ['name' => $mood['name'], 'color' => $mood['color']]
            );
        }

        $this->command->info('✅ Moods seeded successfully');
    }
}
