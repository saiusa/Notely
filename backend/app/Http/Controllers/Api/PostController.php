<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityMember;
use App\Models\Hashtag;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $tab = $request->query('tab'); // Check for ?tab=community parameter

        if ($tab === 'community') {
            // Community tab: posts from joined communities only
            $posts = $this->baseQuery()
                ->where('privacy', 'public')
                ->whereIn('community_id', function ($subquery) use ($user): void {
                    $subquery->select('community_id')
                        ->from('community_members')
                        ->where('user_id', $user->user_id);
                })
                ->orderByDesc('created_at')
                ->paginate(15);
        } else {
            // Home Feed Algorithm:
            // 1. Public posts with no community (global posts)
            // 2. Public posts from communities the user is a member of
            // 3. Own posts (any privacy)
            // Ordered by recency; engagement-based ranking can be layered in future.
            $communityIds = \DB::table('community_members')
                ->where('user_id', $user->user_id)
                ->pluck('community_id');

            $posts = $this->baseQuery()
                ->where(function (Builder $query) use ($user, $communityIds): void {
                    // Own posts (any privacy)
                    $query->where('user_id', $user->user_id)
                        // Public posts with no community
                        ->orWhere(function (Builder $q): void {
                            $q->where('privacy', 'public')
                              ->whereNull('community_id');
                        })
                        // Public posts in communities the user belongs to
                        ->orWhere(function (Builder $q) use ($communityIds): void {
                            $q->where('privacy', 'public')
                              ->whereIn('community_id', $communityIds);
                        });
                })
                ->orderByDesc('created_at')
                ->paginate(15);
        }

        return response()->json($posts);
    }

    /**
     * V1 Trending Algorithm for Explore Feed
     * 
     * Algorithm:
     * 1. Fetch posts from public communities only
     * 2. Order by engagement (likes + comments) DESC - this determines "trending"
     * 3. Then order by recency (created_at) DESC - tie-breaker for same engagement
     * 4. Paginate with 15 posts per page
     * 
     * Future improvements:
     * - Add views_count to weighting
     * - Implement time decay (older posts rank lower)
     * - Add user follower boost
     */
    public function explore(Request $request): JsonResponse
    {
        $posts = $this->baseQuery()
            ->whereNotNull('community_id')  // Only community posts for Explore
            ->where('privacy', 'public')     // Only public posts
            // V1: Sort by engagement (likes + comments) DESC, then by recency DESC
            // We use SQL to sum counts directly in the query for performance
            ->orderByRaw('(likes_count + comments_count) DESC, posts.created_at DESC')
            ->paginate(15);

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        // Validate post creation inputs
        $validated = $request->validate([
            'type' => ['required', 'string', 'in:text,quote,image'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:5000'],
            'community_id' => ['nullable', 'integer', 'exists:communities,community_id'],
            'image' => ['required_if:type,image', 'nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,mp4,mov', 'max:51200'],
            'mood_id' => ['required', 'integer', 'exists:moods,mood_id'],
            'privacy' => ['required', 'in:public,private'],
            'allow_comments' => ['boolean'],
            'is_anonymous' => ['boolean'],
            'anonymous_name' => ['nullable', 'string', 'max:255'],
            'hashtags' => ['sometimes', 'array'],
            'hashtags.*' => ['string', 'max:255'],
        ]);

        $hashtags = $validated['hashtags'] ?? [];
        unset($validated['hashtags']);

        // Ensure user is a member of the community before posting there
        if (
            isset($validated['community_id'])
            && ! $this->isCommunityMember($request->user()->user_id, (int) $validated['community_id'])
        ) {
            return response()->json([
                'message' => 'Join the community before creating a community post.',
            ], 403);
        }

        // Handle image file upload - store relative path for public disk
        if ($request->hasFile('image')) {
            $filename = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('posts', $filename, 'public');
            $validated['image'] = $path;
        }

        // Create post with authenticated user as owner
        $post = Post::create([
            ...$validated,
            'user_id' => $request->user()->user_id,
        ]);

        // Sync hashtags if any provided
        $this->syncHashtags($post, $hashtags);

        // Load relationships and return
        $post->load([
            'user:user_id,username',
            'user.profile:profile_id,user_id,profile_picture',
            'user.setting:user_id,show_reaction_counts,hide_comments',
            'community:community_id,name,category_id',
            'community.category:category_id,slug,name',
            'mood:mood_id,name,color',
            'hashtags:hashtag_id,name',
        ])->loadCount(['comments', 'likes']);

        return response()->json($post, 201);
    }

    public function show(Request $request, Post $post): JsonResponse
    {
        if (! $this->canViewPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to view this post.',
            ], 403);
        }

        // V1 Trending: Increment views counter
        $post->increment('views_count');

        $post->load([
            'user:user_id,username',
            'user.profile:profile_id,user_id,profile_picture',
            'user.setting:user_id,show_reaction_counts,hide_comments',
            'community:community_id,name,category_id',
            'community.category:category_id,slug,name',
            'mood:mood_id,name,color',
            'hashtags:hashtag_id,name',
        ])->loadCount(['comments', 'likes']);

        return response()->json($post);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        // Ensure only the post owner can edit
        if ((int) $post->user_id !== (int) $request->user()->user_id) {
            return response()->json([
                'message' => 'You can only update your own posts.',
            ], 403);
        }

        // Validate post update inputs
        $validated = $request->validate([
            'type' => ['sometimes', 'string', 'in:text,quote,image'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['sometimes', 'string', 'max:5000'],
            'community_id' => ['nullable', 'integer', 'exists:communities,community_id'],
            'image' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,mp4,mov', 'max:51200'],
            'mood_id' => ['sometimes', 'integer', 'exists:moods,mood_id'],
            'privacy' => ['sometimes', 'in:public,private'],
            'allow_comments' => ['sometimes', 'boolean'],
            'is_anonymous' => ['sometimes', 'boolean'],
            'anonymous_name' => ['nullable', 'string', 'max:255'],
            'hashtags' => ['sometimes', 'array'],
            'hashtags.*' => ['string', 'max:255'],
        ]);

        // Prevent changing post type during edit (preserve original post type)
        if (isset($validated['type']) && $validated['type'] !== $post->type) {
            return response()->json([
                'message' => 'You cannot change the post type during an edit.',
            ], 422);
        }
        unset($validated['type']); // Don't update type in database

        // Validate community membership if moving post
        if (
            isset($validated['community_id'])
            && ! $this->isCommunityMember($request->user()->user_id, (int) $validated['community_id'])
        ) {
            return response()->json([
                'message' => 'Join the community before moving a post there.',
            ], 403);
        }

        // Handle hashtag syncing if provided
        if (array_key_exists('hashtags', $validated)) {
            $this->syncHashtags($post, $validated['hashtags'] ?? []);
            unset($validated['hashtags']);
        }

        // Handle image file upload - CRITICAL: only update if new file was uploaded
        if ($request->hasFile('image')) {
            // Delete old image file if it exists
            if ($post->image && Storage::disk('public')->exists(str_replace('/storage/', '', $post->image))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $post->image));
            }

            // Store new image file
            $filename = time() . '_' . uniqid() . '.' . $request->file('image')->getClientOriginalExtension();
            $path = $request->file('image')->storeAs('posts', $filename, 'public');
            $validated['image'] = $path;
        }
        // If no new image uploaded, don't modify the image field - keep existing

        // Update only the provided fields
        $post->update($validated);

        // Reload with all relationships to return updated post
        $post->load([
            'user:user_id,username',
            'user.profile:profile_id,user_id,profile_picture',
            'user.setting:user_id,show_reaction_counts,hide_comments',
            'community:community_id,name,category_id',
            'community.category:category_id,slug,name',
            'mood:mood_id,name,color',
            'hashtags:hashtag_id,name',
        ])->loadCount(['comments', 'likes']);

        return response()->json($post, 200);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        if ((int) $post->user_id !== (int) $request->user()->user_id) {
            return response()->json([
                'message' => 'You can only delete your own posts.',
            ], 403);
        }

        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully.',
        ]);
    }

    public function privateJournal(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = $this->baseQuery()
            ->where('user_id', $user->user_id)
            ->where('privacy', 'private')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($posts);
    }

    public function publicJournal(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = $this->baseQuery()
            ->where('user_id', $user->user_id)
            ->where('privacy', 'public')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($posts);
    }

    private function baseQuery(): Builder
    {
        return Post::query()
            ->with([
                'user:user_id,username',
                'user.profile:profile_id,user_id,profile_picture',
                'user.setting:user_id,show_reaction_counts,hide_comments',
                'community:community_id,name,category_id',
                'community.category:category_id,slug,name',
                'mood:mood_id,name,color',
                'hashtags:hashtag_id,name',
            ])
            ->withCount(['comments', 'likes']);
    }

    private function canViewPost(Request $request, Post $post): bool
    {
        if ($post->privacy === 'public') {
            return true;
        }

        if ((int) $post->user_id === (int) $request->user()->user_id) {
            return true;
        }

        if ($post->community_id === null) {
            return false;
        }

        return $this->isCommunityMember($request->user()->user_id, (int) $post->community_id);
    }

    /**
     * @param array<int, string> $hashtags
     */
    private function syncHashtags(Post $post, array $hashtags): void
    {
        $names = collect($hashtags)
            ->map(fn (string $name): string => trim($name))
            ->filter(fn (string $name): bool => $name !== '')
            ->unique()
            ->values();

        $hashtagIds = $names->map(function (string $name): int {
            return Hashtag::firstOrCreate(['name' => $name])->hashtag_id;
        })->all();

        $post->hashtags()->sync($hashtagIds);
    }

    private function isCommunityMember(int $userId, int $communityId): bool
    {
        return CommunityMember::query()
            ->where('user_id', $userId)
            ->where('community_id', $communityId)
            ->exists();
    }
}
