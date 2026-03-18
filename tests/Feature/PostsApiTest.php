<?php

namespace Tests\Feature;

use App\Models\Comment;
use App\Models\Hashtag;
use App\Models\Mood;
use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PostsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_post_with_hashtags(): void
    {
        $user = User::factory()->create();
        $mood = Mood::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/posts', [
            'content' => 'My first API post',
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
            'allow_comments' => true,
            'is_anonymous' => false,
            'hashtags' => ['laravel', 'api'],
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('content', 'My first API post');

        $this->assertDatabaseHas('posts', [
            'content' => 'My first API post',
            'user_id' => $user->user_id,
        ]);

        $this->assertDatabaseHas('hashtags', ['name' => 'laravel']);
        $this->assertDatabaseHas('hashtags', ['name' => 'api']);

        $post = Post::where('content', 'My first API post')->firstOrFail();
        $this->assertCount(2, $post->hashtags);
    }

    public function test_private_post_is_not_visible_to_other_users(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $mood = Mood::factory()->create();

        $privatePost = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'private',
        ]);

        Sanctum::actingAs($otherUser);

        $this->getJson('/api/posts/'.$privatePost->post_id)
            ->assertForbidden();
    }

    public function test_user_can_only_update_own_post(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'content' => 'Original content',
        ]);

        Sanctum::actingAs($otherUser);

        $this->patchJson('/api/posts/'.$post->post_id, [
            'content' => 'Hacked content',
        ])->assertForbidden();

        $this->assertDatabaseHas('posts', [
            'post_id' => $post->post_id,
            'content' => 'Original content',
        ]);
    }

    public function test_user_can_update_post_and_resync_hashtags(): void
    {
        $user = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $user->user_id,
            'mood_id' => $mood->mood_id,
        ]);

        $initialHashtag = Hashtag::factory()->create(['name' => 'oldtag']);
        $post->hashtags()->sync([$initialHashtag->hashtag_id]);

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/posts/'.$post->post_id, [
            'content' => 'Updated content',
            'hashtags' => ['newtag', 'backend'],
        ]);

        $response->assertOk()->assertJsonPath('content', 'Updated content');

        $post->refresh();

        $this->assertSame('Updated content', $post->content);
        $this->assertEqualsCanonicalizing(['newtag', 'backend'], $post->hashtags()->pluck('name')->all());
    }

    public function test_comment_creation_respects_allow_comments_flag(): void
    {
        $owner = User::factory()->create();
        $commenter = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $owner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
            'allow_comments' => false,
        ]);

        Sanctum::actingAs($commenter);

        $this->postJson('/api/posts/'.$post->post_id.'/comments', [
            'content' => 'This should fail',
        ])->assertStatus(422);

        $this->assertDatabaseMissing('comments', [
            'post_id' => $post->post_id,
            'content' => 'This should fail',
        ]);
    }

    public function test_comment_owner_or_post_owner_can_delete_comment(): void
    {
        $postOwner = User::factory()->create();
        $commentOwner = User::factory()->create();
        $thirdUser = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $postOwner->user_id,
            'mood_id' => $mood->mood_id,
        ]);

        $comment = Comment::factory()->create([
            'user_id' => $commentOwner->user_id,
            'post_id' => $post->post_id,
        ]);

        Sanctum::actingAs($thirdUser);
        $this->deleteJson('/api/posts/'.$post->post_id.'/comments/'.$comment->comment_id)
            ->assertForbidden();

        Sanctum::actingAs($postOwner);
        $this->deleteJson('/api/posts/'.$post->post_id.'/comments/'.$comment->comment_id)
            ->assertOk();

        $this->assertDatabaseMissing('comments', [
            'comment_id' => $comment->comment_id,
        ]);
    }

    public function test_liking_same_post_twice_remains_single_like(): void
    {
        $postOwner = User::factory()->create();
        $liker = User::factory()->create();
        $mood = Mood::factory()->create();

        $post = Post::factory()->create([
            'user_id' => $postOwner->user_id,
            'mood_id' => $mood->mood_id,
            'privacy' => 'public',
        ]);

        Sanctum::actingAs($liker);

        $this->postJson('/api/posts/'.$post->post_id.'/likes')->assertCreated();
        $this->postJson('/api/posts/'.$post->post_id.'/likes')->assertCreated();

        $this->assertDatabaseCount('likes', 1);

        $this->deleteJson('/api/posts/'.$post->post_id.'/likes')->assertOk();
        $this->assertDatabaseCount('likes', 0);
    }
}
