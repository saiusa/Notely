<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\Mood;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SocialModulesApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_comment_creates_notification_for_post_owner(): void
    {
        $owner = User::factory()->create();
        $commenter = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
            'allow_comments' => true,
        ]);

        Sanctum::actingAs($commenter);

        $this->postJson('/api/posts/'.$post->post_id.'/comments', [
            'content' => 'Nice post',
        ])->assertCreated();

        Sanctum::actingAs($owner);
        $this->getJson('/api/notifications/unread-count')
            ->assertOk()
            ->assertJsonPath('unread_count', 1);
    }

    public function test_like_creates_single_notification_for_post_owner(): void
    {
        $owner = User::factory()->create();
        $liker = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
        ]);

        Sanctum::actingAs($liker);
        $this->postJson('/api/posts/'.$post->post_id.'/likes')->assertCreated();
        $this->postJson('/api/posts/'.$post->post_id.'/likes')->assertCreated();

        Sanctum::actingAs($owner);
        $this->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('data.0.type', 'like');

        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_user_can_join_and_leave_community(): void
    {
        $user = User::factory()->create();
        $community = Community::factory()->create();

        Sanctum::actingAs($user);

        $this->postJson('/api/communities/'.$community->community_id.'/join')
            ->assertCreated();

        $this->assertDatabaseHas('community_members', [
            'user_id' => $user->user_id,
            'community_id' => $community->community_id,
        ]);

        $this->deleteJson('/api/communities/'.$community->community_id.'/leave')
            ->assertOk();

        $this->assertDatabaseMissing('community_members', [
            'user_id' => $user->user_id,
            'community_id' => $community->community_id,
        ]);
    }

    public function test_user_can_report_visible_post_and_list_own_reports(): void
    {
        $owner = User::factory()->create();
        $reporter = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
        ]);

        Sanctum::actingAs($reporter);

        $this->postJson('/api/posts/'.$post->post_id.'/reports', [
            'reason' => 'Spam content',
        ])->assertCreated();

        $this->getJson('/api/reports/me')
            ->assertOk()
            ->assertJsonPath('data.0.post_id', $post->post_id);
    }

    public function test_user_cannot_report_private_post_of_another_user(): void
    {
        $owner = User::factory()->create();
        $reporter = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'private',
        ]);

        Sanctum::actingAs($reporter);

        $this->postJson('/api/posts/'.$post->post_id.'/reports', [
            'reason' => 'Spam content',
        ])->assertForbidden();
    }

    public function test_explore_can_see_public_community_posts(): void
    {
        $owner = User::factory()->create();
        $explorer = User::factory()->create();
        $community = Community::factory()->create();
        $mood = Mood::factory()->create();

        Post::factory()->create([
            'user_id' => $owner->user_id,
            'community_id' => $community->community_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
            'content' => 'Public community post',
        ]);

        Sanctum::actingAs($explorer);

        $this->getJson('/api/communities/'.$community->community_id.'/posts')
            ->assertOk()
            ->assertJsonPath('data.0.content', 'Public community post');
    }

    public function test_joined_member_can_see_private_community_posts(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $community = Community::factory()->create();
        $mood = Mood::factory()->create();

        Sanctum::actingAs($member);

        $this->postJson('/api/communities/'.$community->community_id.'/join')
            ->assertCreated();

        Post::factory()->create([
            'user_id' => $owner->user_id,
            'community_id' => $community->community_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'private',
            'content' => 'Private community post',
        ]);

        Sanctum::actingAs($member);

        $this->getJson('/api/communities/'.$community->community_id.'/posts')
            ->assertOk()
            ->assertJsonPath('data.0.content', 'Private community post');
    }
}
