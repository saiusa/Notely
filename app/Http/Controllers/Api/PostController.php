<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityMember;
use App\Models\Hashtag;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = $this->baseQuery()
            ->where(function (Builder $query) use ($user): void {
                $query->where('privacy', 'public')
                    ->orWhere('user_id', $user->user_id);
            })
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string'],
            'community_id' => ['nullable', 'exists:communities,community_id'],
            'image' => ['nullable', 'string', 'max:255'],
            'mood_id' => ['required', 'exists:moods,mood_id'],
            'privacy' => ['required', 'in:public,private'],
            'allow_comments' => ['boolean'],
            'is_anonymous' => ['boolean'],
            'hashtags' => ['sometimes', 'array'],
            'hashtags.*' => ['string', 'max:255'],
        ]);

        $hashtags = $validated['hashtags'] ?? [];
        unset($validated['hashtags']);

        if (
            isset($validated['community_id'])
            && ! $this->isCommunityMember($request->user()->user_id, (int) $validated['community_id'])
        ) {
            return response()->json([
                'message' => 'Join the community before creating a community post.',
            ], 403);
        }

        $post = Post::create([
            ...$validated,
            'user_id' => $request->user()->user_id,
        ]);

        $this->syncHashtags($post, $hashtags);

        $post->load([
            'user:user_id,username',
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

        $post->load([
            'user:user_id,username',
            'mood:mood_id,name,color',
            'hashtags:hashtag_id,name',
        ])->loadCount(['comments', 'likes']);

        return response()->json($post);
    }

    public function update(Request $request, Post $post): JsonResponse
    {
        if ((int) $post->user_id !== (int) $request->user()->user_id) {
            return response()->json([
                'message' => 'You can only update your own posts.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['sometimes', 'string'],
            'community_id' => ['nullable', 'exists:communities,community_id'],
            'image' => ['nullable', 'string', 'max:255'],
            'mood_id' => ['sometimes', 'exists:moods,mood_id'],
            'privacy' => ['sometimes', 'in:public,private'],
            'allow_comments' => ['sometimes', 'boolean'],
            'is_anonymous' => ['sometimes', 'boolean'],
            'hashtags' => ['sometimes', 'array'],
            'hashtags.*' => ['string', 'max:255'],
        ]);

        if (array_key_exists('hashtags', $validated)) {
            $this->syncHashtags($post, $validated['hashtags'] ?? []);
            unset($validated['hashtags']);
        }

        if (
            isset($validated['community_id'])
            && ! $this->isCommunityMember($request->user()->user_id, (int) $validated['community_id'])
        ) {
            return response()->json([
                'message' => 'Join the community before moving a post there.',
            ], 403);
        }

        $post->update($validated);

        $post->load([
            'user:user_id,username',
            'mood:mood_id,name,color',
            'hashtags:hashtag_id,name',
        ])->loadCount(['comments', 'likes']);

        return response()->json($post);
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

    private function baseQuery(): Builder
    {
        return Post::query()
            ->with([
                'user:user_id,username',
                'community:community_id,name',
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
