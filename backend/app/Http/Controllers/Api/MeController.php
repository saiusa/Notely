<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'profile',
            'setting',
            'communities:communities.community_id,communities.name,communities.description,communities.image,communities.created_at',
        ]);

        return response()->json($user);
    }

    /**
     * GET /api/me/posts
     * Returns all of the authenticated user's posts (both public and private),
     * with full relationships and engagement counts.
     */
    public function myPosts(Request $request): JsonResponse
    {
        $user = $request->user();

        $posts = Post::where('user_id', $user->user_id)
            ->with([
                'user:user_id,username',
                'user.profile:profile_id,user_id,profile_picture',
                'user.setting:user_id,show_reaction_counts,hide_comments',
                'community:community_id,name,category_id',
                'community.category:category_id,slug,name',
                'mood:mood_id,name,color',
                'hashtags:hashtag_id,name',
            ])
            ->withCount(['comments', 'likes'])
            ->orderByDesc('created_at')
            ->paginate(30);

        return response()->json($posts);
    }
}
