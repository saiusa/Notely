# V1 Trending Algorithm Implementation Guide

## Overview

This document outlines the implementation of Notely's V1 Trending Algorithm for the Explore feed. The algorithm prioritizes content based on engagement (likes + comments) with recency as a tie-breaker.

---

## What Was Implemented

### ✅ 1. Explore Feed Endpoint

**Location:** `PostController@explore()`  
**Route:** `GET /api/posts/explore`

**Algorithm Logic:**
```
1. Fetch posts from PUBLIC COMMUNITIES ONLY
2. Order by: (likes_count + comments_count) DESC
3. Then order by: created_at DESC (recency tie-breaker)
4. Paginate: 15 posts per page
```

**Code:**
```php
public function explore(Request $request): JsonResponse
{
    $posts = $this->baseQuery()
        ->whereNotNull('community_id')  // Only community posts
        ->where('privacy', 'public')     // Only public posts
        ->orderByRaw('(likes_count + comments_count) DESC, posts.created_at DESC')
        ->paginate(15);

    return response()->json($posts);
}
```

---

### ✅ 2. Database Migrations

Two migrations have been created:

#### A. Views Counter (Always Required)
**File:** `database/migrations/2024_04_16_add_views_count_to_posts.php`

```sql
ALTER TABLE posts ADD COLUMN views_count BIGINT DEFAULT 0 INDEX;
```

**Usage:** 
- Tracks how many times a post has been viewed
- Increment in `PostController@show()`:
  ```php
  $post->increment('views_count');
  ```

#### B. Engagement Counts (Recommended)
**File:** `database/migrations/2024_04_16_add_engagement_counts_to_posts.php`

```sql
ALTER TABLE posts ADD COLUMN likes_count BIGINT DEFAULT 0 INDEX;
ALTER TABLE posts ADD COLUMN comments_count BIGINT DEFAULT 0 INDEX;
```

**Why:** The trending query needs to order by engagement. Without denormalized columns, it would calculate counts on every query (slow at scale).

---

### ✅ 3. Engagement Count Synchronization

**File:** `app/Listeners/UpdatePostEngagementCounts.php`

This listener automatically keeps engagement counts in sync:
- When a Like is created → increment `likes_count`
- When a Like is deleted → decrement `likes_count`  
- When a Comment is created → increment `comments_count`
- When a Comment is deleted → decrement `comments_count`

---

## Setup Instructions

### Step 1: Run Migrations

```bash
# Run both migrations
php artisan migrate

# Or specific migration
php artisan migrate --path=database/migrations/2024_04_16_add_views_count_to_posts.php
php artisan migrate --path=database/migrations/2024_04_16_add_engagement_counts_to_posts.php
```

### Step 2: Create Events (If Not Exists)

If you don't have event classes, create them:

```bash
php artisan make:event PostLikeCreated
php artisan make:event PostLikeDeleted
php artisan make:event PostCommentCreated
php artisan make:event PostCommentDeleted
```

### Step 3: Register Event Listeners

In `app/Providers/EventServiceProvider.php`:

```php
protected $listen = [
    PostLikeCreated::class => [
        UpdatePostEngagementCounts::class . '@handleLikeCreated',
    ],
    PostLikeDeleted::class => [
        UpdatePostEngagementCounts::class . '@handleLikeDeleted',
    ],
    PostCommentCreated::class => [
        UpdatePostEngagementCounts::class . '@handleCommentCreated',
    ],
    PostCommentDeleted::class => [
        UpdatePostEngagementCounts::class . '@handleCommentDeleted',
    ],
];
```

Or use automatic discovery in.env:

```ini
EVENT_DISCOVERY=true
```

### Step 4: Fire Events from Like/Comment Controllers

When creating a like in `PostLikeController@store()`:

```php
$like = Like::create(['post_id' => $post->post_id, 'user_id' => $user->user_id]);
PostLikeCreated::dispatch($like, $post);
```

When deleting a like in `PostLikeController@destroy()`:

```php
$like->delete();
PostLikeDeleted::dispatch($like, $post);
```

---

## API Usage

### Explore Feed Endpoint

```bash
# Fetch trending posts (sorted by engagement)
GET /api/posts/explore?page=1

# Response
{
  "data": [
    {
      "post_id": 1,
      "user_id": 5,
      "community_id": 2,
      "content": "This is trending!",
      "likes_count": 42,
      "comments_count": 18,
      "views_count": 156,
      "created_at": "2024-04-16T10:30:00Z",
      "user": { "user_id": 5, "username": "john_doe" },
      "community": { "community_id": 2, "name": "Tech Talk" },
      "likes_count": 42,
      "comments_count": 18
    }
  ],
  "meta": { "current_page": 1, "per_page": 15, "total": 342 }
}
```

---

## V1 vs Future Versions

### V1 (Current) - Simple Engagement
```
Trending Score = likes_count + comments_count
Order By: DESC (engagement), DESC (recency)
```

### V2 (Recommended Future)
```
Trending Score = (likes * 1) + (comments * 2) + (views * 0.1)
                 - (age_in_hours * 0.5)  // Time decay
Order By: DESC (weighted_score)
```

### V3 (Advanced)
```
Include:
- User follower count boost
- Community category preferences
- User interaction history
- Personalized ranking per user
```

---

## Testing

### Test the Endpoint

```bash
# Curl
curl -X GET "http://localhost:8000/api/posts/explore?page=1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Accept: application/json"

# Laravel Artisan Tinker
php artisan tinker
>>> Route('posts.explore')
>>> \App\Http\Controllers\Api\PostController::class . '@explore'
```

### Test View Counter

```bash
php artisan tinker
>>> $post = Post::first();
>>> $post->views_count;  // Should be 0
>>> $post->increment('views_count');
>>> $post->refresh();
>>> $post->views_count;  // Should be 1
```

---

## Performance Considerations

✅ **What's Optimized:**
- Uses `withCount()` for efficient counting
- Indexes on `likes_count`, `comments_count`, `views_count`
- Pagination (15 per page) to limit load
- Denormalized counts avoid JOIN calculations

⚠️ **What's Not (Future Optimization):**
- No caching of trending posts yet
- No time-decay weighting
- Views aren't included in trending (only in DB now)

### Add View Counter to Trending (Optional)

Update `PostController@explore()`:

```php
->orderByRaw('(likes_count + (comments_count * 2) + (views_count * 0.1)) DESC, posts.created_at DESC')
```

---

## Database Schema After Migrations

```
posts
├── post_id (PRIMARY)
├── user_id (FK)
├── community_id (FK)
├── content
├── privacy
├── created_at
├── updated_at
├── views_count (bigint, indexed)      ✨ NEW
├── likes_count (bigint, indexed)      ✨ NEW
├── comments_count (bigint, indexed)   ✨ NEW
└── ...
```

---

## Troubleshooting

### Issue: Explore route returns 404
**Solution:** Check route registration in `routes/api.php` line 45

### Issue: Engagement counts always 0
**Solution:** Make sure events are being fired from Like/Comment controllers

### Issue: Query slow on large dataset
**Solution:** Ensure indexes exist on `likes_count`, `comments_count`, `views_count`

```php
// In migration
$table->bigInteger('likes_count')->default(0)->index();
```

---

## Summary

| Component | Status | Location |
|-----------|--------|----------|
| Explore Endpoint | ✅ Complete | `PostController@explore()` |
| Route Registration | ✅ Complete | `routes/api.php:45` |
| Views Counter Migration | ✅ Complete | `migrations/2024_04_16_add_views_count...` |
| Engagement Counts Migration | ✅ Complete | `migrations/2024_04_16_add_engagement_counts...` |
| Model Updates | ✅ Complete | `Post@fillable` |
| Event Listener | ✅ Complete | `app/Listeners/UpdatePostEngagementCounts.php` |
| Post Show View Tracking | ✅ Complete | `PostController@show()` |

---

**Ready to deploy!** Run migrations and register event listeners. 🚀
