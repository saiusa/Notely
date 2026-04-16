<?php

namespace App\Listeners;

use App\Events\PostLikeCreated;
use App\Events\PostLikeDeleted;
use App\Events\PostCommentCreated;
use App\Events\PostCommentDeleted;

/**
 * V1 Trending Algorithm - Engagement Count Synchronization
 * 
 * These listeners keep the denormalized engagement counts in sync
 * with the actual like/comment records.
 * 
 * When a like or comment is created/deleted, the corresponding post's
 * engagement counters are automatically updated.
 * 
 * This ensures the trending algorithm always has accurate data.
 */

class UpdatePostEngagementCounts
{
    /**
     * Handle Like Created Event
     * Increment likes_count when a new like is added
     */
    public function handleLikeCreated(PostLikeCreated $event): void
    {
        $event->post->increment('likes_count');
    }

    /**
     * Handle Like Deleted Event
     * Decrement likes_count when a like is removed
     */
    public function handleLikeDeleted(PostLikeDeleted $event): void
    {
        $event->post->decrement('likes_count');
    }

    /**
     * Handle Comment Created Event
     * Increment comments_count when a new comment is added
     */
    public function handleCommentCreated(PostCommentCreated $event): void
    {
        $event->post->increment('comments_count');
    }

    /**
     * Handle Comment Deleted Event
     * Decrement comments_count when a comment is removed
     */
    public function handleCommentDeleted(PostCommentDeleted $event): void
    {
        $event->post->decrement('comments_count');
    }
}
