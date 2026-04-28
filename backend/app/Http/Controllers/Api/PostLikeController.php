<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityMember;
use App\Models\Like;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostLikeController extends Controller
{
    public function index(Request $request, Post $post): JsonResponse
    {
        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to access likes for this post.',
            ], 403);
        }

        $likesCount = $post->likes()->count();
        $likedByUser = $post->likes()->where('user_id', $request->user()->user_id)->exists();

        return response()->json([
            'post_id' => $post->post_id,
            'likes_count' => $likesCount,
            'liked_by_user' => $likedByUser,
        ]);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to like this post.',
            ], 403);
        }

        $like = Like::firstOrCreate([
            'user_id' => $request->user()->user_id,
            'post_id' => $post->post_id,
        ]);

        if (
            $like->wasRecentlyCreated
            && (int) $post->user_id !== (int) $request->user()->user_id
        ) {
            $causer = $request->user()->load('profile');
            $causerName = trim(($causer->profile->first_name ?? '') . ' ' . ($causer->profile->last_name ?? ''));
            Notification::create([
                'user_id'      => $post->user_id,
                'type'         => 'like',
                'reference_id' => $like->like_id,
                'is_read'      => false,
                'data'         => [
                    'causer_id'     => $causer->user_id,
                    'causer_name'   => $causerName ?: $causer->username,
                    'causer_avatar' => $causer->profile->profile_picture ?? null,
                    'action'        => 'liked your post',
                    'snippet'       => null,
                    'post_id'       => $post->post_id,
                    'target_url'    => '?postId=' . $post->post_id,
                ],
            ]);
        }

        return response()->json([
            'message' => 'Post liked successfully.',
            'likes_count' => $post->likes()->count(),
            'liked_by_user' => true,
        ], 201);
    }

    public function destroy(Request $request, Post $post): JsonResponse
    {
        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to unlike this post.',
            ], 403);
        }

        Like::query()
            ->where('user_id', $request->user()->user_id)
            ->where('post_id', $post->post_id)
            ->delete();

        return response()->json([
            'message' => 'Post unliked successfully.',
            'likes_count' => $post->likes()->count(),
            'liked_by_user' => false,
        ]);
    }

    private function canInteractWithPost(Request $request, Post $post): bool
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

        return CommunityMember::query()
            ->where('user_id', $request->user()->user_id)
            ->where('community_id', $post->community_id)
            ->exists();
    }
}
