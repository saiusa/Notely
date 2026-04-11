<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $timestamp = now();

        // Insert categories
        $categories = [
            [
                'category_id' => 1,
                'name' => 'Gratitude',
                'slug' => 'gratitude',
                'image' => '/storage/communities/category/Gratitude.jpg',
                'created_at' => $timestamp,
            ],
            [
                'category_id' => 2,
                'name' => 'Healing Era',
                'slug' => 'healing-era',
                'image' => '/storage/communities/category/healing-era.jpg',
                'created_at' => $timestamp,
            ],
            [
                'category_id' => 3,
                'name' => 'Manifestation',
                'slug' => 'manifestation',
                'image' => '/storage/communities/category/manifestation.jpg',
                'created_at' => $timestamp,
            ],
            [
                'category_id' => 4,
                'name' => 'Personal Growth',
                'slug' => 'personal-growth',
                'image' => '/storage/communities/category/personal-growth.jpg',
                'created_at' => $timestamp,
            ],
            [
                'category_id' => 5,
                'name' => 'Poetry',
                'slug' => 'poetry',
                'image' => '/storage/communities/category/poetry.jpg',
                'created_at' => $timestamp,
            ],
            [
                'category_id' => 6,
                'name' => 'Dark Academia',
                'slug' => 'dark-academia',
                'image' => '/storage/communities/category/dark-academia.jpg',
                'created_at' => $timestamp,
            ],
        ];

        DB::table('categories')->insert($categories);

        // Insert communities
        $communities = [
            // Gratitude
            ['community_id' => 101, 'category_id' => 1, 'name' => 'Morning Gratitude', 'description' => 'Start your day with gratitude. Share what you\'re thankful for each morning to cultivate a positive mindset and set a beautiful tone for your day ahead.', 'image' => '/storage/communities/category-list/Gratitude-list/morning-gratitude.jpg', 'created_at' => $timestamp],
            ['community_id' => 102, 'category_id' => 1, 'name' => 'Small Wins Today', 'description' => 'Celebrate the little victories that often go unnoticed. Every small win matters—acknowledge them, savor them, and recognize your progress.', 'image' => '/storage/communities/category-list/Gratitude-list/small-wins.jpg', 'created_at' => $timestamp],
            ['community_id' => 103, 'category_id' => 1, 'name' => 'Unexpected Blessings', 'description' => 'Document those surprise moments of joy that catch you off guard. These unexpected blessings remind us that magic exists in the ordinary.', 'image' => '/storage/communities/category-list/Gratitude-list/unexpected-blessings.jpg', 'created_at' => $timestamp],
            ['community_id' => 104, 'category_id' => 1, 'name' => 'Gratitude for Hard Times', 'description' => 'Transform difficult moments into growth opportunities. Explore what you\'ve learned and appreciated even during your toughest challenges.', 'image' => '/storage/communities/category-list/Gratitude-list/hard-times.jpg', 'created_at' => $timestamp],
            ['community_id' => 105, 'category_id' => 1, 'name' => 'Letters of Appreciation', 'description' => 'Write thank-you notes to people, places, or experiences that have shaped your life. Express gratitude in a deeply personal way.', 'image' => '/storage/communities/category-list/Gratitude-list/letter-writing.jpg', 'created_at' => $timestamp],

            // Healing Era
            ['community_id' => 201, 'category_id' => 2, 'name' => 'Letters I\'ll Never Send', 'description' => 'Write the words you need to say but never will. This safe space allows you to express your truth, anger, forgiveness, and closure without judgment.', 'image' => '/storage/communities/category-list/HealingEra-list/letter-never-send.jpg', 'created_at' => $timestamp],
            ['community_id' => 202, 'category_id' => 2, 'name' => 'Things I\'m Letting Go', 'description' => 'Document what you\'re releasing—habits, emotions, relationships, beliefs. Witness your own strength as you make space for new growth.', 'image' => '/storage/communities/category-list/HealingEra-list/not-letting-go.jpg', 'created_at' => $timestamp],
            ['community_id' => 203, 'category_id' => 2, 'name' => 'Shadow Work', 'description' => 'Explore your shadow self with curiosity and compassion. Uncover what you\'ve hidden and integrate all parts of yourself for wholeness.', 'image' => '/storage/communities/category-list/HealingEra-list/shadow-dark%20.jpg', 'created_at' => $timestamp],
            ['community_id' => 204, 'category_id' => 2, 'name' => 'Dear Younger Me', 'description' => 'Write letters to your younger self. Offer wisdom, comfort, and reassurance to the version of you who needed it most.', 'image' => '/storage/communities/category-list/HealingEra-list/dear-young-me.jpg', 'created_at' => $timestamp],
            ['community_id' => 205, 'category_id' => 2, 'name' => 'Progress Not Perfection', 'description' => 'Celebrate your messy, imperfect healing journey. Progress isn\'t linear—share your ups, downs, and all the in-betweens.', 'image' => '/storage/communities/category-list/HealingEra-list/progress-journal.jpg', 'created_at' => $timestamp],
            ['community_id' => 206, 'category_id' => 2, 'name' => 'Recovery Journey', 'description' => 'Share your path to recovery—from addiction, illness, heartbreak, or loss. Find strength in community and celebrate every milestone.', 'image' => '/storage/communities/category-list/HealingEra-list/recovery.jpg', 'created_at' => $timestamp],

            // Manifestation
            ['community_id' => 301, 'category_id' => 3, 'name' => 'Vision Board Journal', 'description' => 'Visualize and document your dreams through words. Paint a vivid picture of the life you\'re manifesting into reality.', 'image' => '/storage/communities/category-list/Manifestation-list/vision-board.jpg', 'created_at' => $timestamp],
            ['community_id' => 302, 'category_id' => 3, 'name' => 'Scripting My Dream Life', 'description' => 'Write your future as if it\'s already happening. Use the power of scripting to align your energy with your desires.', 'image' => '/storage/communities/category-list/Manifestation-list/dream-life.jpg', 'created_at' => $timestamp],
            ['community_id' => 303, 'category_id' => 3, 'name' => 'Affirmations', 'description' => 'Reprogram your beliefs with powerful affirmations. Share what you\'re affirming daily and witness the shift in your reality.', 'image' => '/storage/communities/category-list/Manifestation-list/affirmation.jpg', 'created_at' => $timestamp],
            ['community_id' => 304, 'category_id' => 3, 'name' => 'Future Self Letters', 'description' => 'Write to your future self with your current dreams, hopes, and commitments. Create a beautiful record of your intentional journey.', 'image' => '/storage/communities/category-list/Manifestation-list/letter-futureself.jpg', 'created_at' => $timestamp],
            ['community_id' => 305, 'category_id' => 3, 'name' => 'Monthly Intentions', 'description' => 'Set your intentions for each month with clarity and purpose. Track how you\'re aligning with what matters most to you.', 'image' => '/storage/communities/category-list/Manifestation-list/monthly-intention.jpg', 'created_at' => $timestamp],
            ['community_id' => 306, 'category_id' => 3, 'name' => 'Manifestation Wins', 'description' => 'Celebrate what you\'ve manifested! Share your wins, synchronicities, and proof that your dreams do come true.', 'image' => '/storage/communities/category-list/Manifestation-list/manifestation-win.jpg', 'created_at' => $timestamp],

            // Personal Growth
            ['community_id' => 401, 'category_id' => 4, 'name' => 'Habit Tracker Journal', 'description' => 'Build better habits intentionally. Track your progress, celebrate consistency, and witness your transformation over time.', 'image' => '/storage/communities/category-list/PersonalGrowth-list/habit-tracker.jpg', 'created_at' => $timestamp],
            ['community_id' => 402, 'category_id' => 4, 'name' => 'Reading Log', 'description' => 'Document your reading journey and reflections. Share what you\'ve learned, your favorite quotes, and books that changed your perspective.', 'image' => '/storage/communities/category-list/PersonalGrowth-list/reading-log.jpg', 'created_at' => $timestamp],
            ['community_id' => 403, 'category_id' => 4, 'name' => 'Mistakes & Lessons', 'description' => 'Turn your failures into wisdom. Reflect on what went wrong, what you learned, and how you\'ve grown from the experience.', 'image' => '/storage/communities/category-list/PersonalGrowth-list/mistakes-lessons.jpg', 'created_at' => $timestamp],
            ['community_id' => 404, 'category_id' => 4, 'name' => 'Career Goals', 'description' => 'Navigate your professional journey with intention. Set goals, celebrate achievements, and process your career evolution.', 'image' => '/storage/communities/category-list/PersonalGrowth-list/career-goals.jpg', 'created_at' => $timestamp],
            ['community_id' => 405, 'category_id' => 4, 'name' => 'Weekly Reviews', 'description' => 'Reflect weekly on your progress, wins, challenges, and lessons. Use this space to align with your priorities and adjust your path.', 'image' => '/storage/communities/category-list/PersonalGrowth-list/weekly-reviews.jpg', 'created_at' => $timestamp],

            // Poetry
            ['community_id' => 501, 'category_id' => 5, 'name' => 'Love Poems', 'description' => 'Pour your heart onto the page. Share poems celebrating love, connection, desire, and the beauty of deep human intimacy.', 'image' => '/storage/communities/category-list/Poetry-list/love-poems.jpg', 'created_at' => $timestamp],
            ['community_id' => 502, 'category_id' => 5, 'name' => 'Heartbreak Verses', 'description' => 'Transform heartbreak into art. Write about loss, longing, and resilience in your most vulnerable and poetic form.', 'image' => '/storage/communities/category-list/Poetry-list/hearbreak-verses.jpg', 'created_at' => $timestamp],
            ['community_id' => 503, 'category_id' => 5, 'name' => 'Midnight Thoughts in Verse', 'description' => 'Capture those late-night epiphanies and raw emotions in poetic form. Share the musings that come when the world is still.', 'image' => '/storage/communities/category-list/Poetry-list/midnight-verse.jpg', 'created_at' => $timestamp],

            // Dark Academia
            ['community_id' => 601, 'category_id' => 6, 'name' => 'Philosophical Musings', 'description' => 'Explore life\'s biggest questions through thoughtful reflection. Engage with philosophy, existentialism, and the mysteries of existence.', 'image' => '/storage/communities/category-list/DarkAcademia-list/philosophical-musings.jpg', 'created_at' => $timestamp],
            ['community_id' => 602, 'category_id' => 6, 'name' => 'Late Night Thoughts', 'description' => 'Delve into introspection during those quiet hours. Share your deepest contemplations about meaning, purpose, and the human condition.', 'image' => '/storage/communities/category-list/DarkAcademia-list/late-night-thoughts.jpg', 'created_at' => $timestamp],
            ['community_id' => 603, 'category_id' => 6, 'name' => 'Coffee Shop Observations', 'description' => 'Document your observations of life, people, and society. Write like you\'re in a cozy corner café, watching the world go by.', 'image' => '/storage/communities/category-list/DarkAcademia-list/coffee-shop-observations.jpg', 'created_at' => $timestamp],
            ['community_id' => 604, 'category_id' => 6, 'name' => 'Film & Cinema Notes', 'description' => 'Dissect films that move you. Share film criticism, cinematography analysis, and how movies reflect the human experience.', 'image' => '/storage/communities/category-list/DarkAcademia-list/film-cinema-notes.jpg', 'created_at' => $timestamp],
        ];

        DB::table('communities')->insert($communities);
    }
}
