<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\Post;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class SearchController extends Controller
{
    /**
     * Search posts, communities, and users
     * GET /api/search?q=query
     */
    public function index(Request $request): JsonResponse
    {
        $q = $request->query('q');

        if (!$q || strlen(trim($q)) < 2) {
            return response()->json([
                'users' => [],
                'communities' => [],
                'posts' => [],
            ]);
        }

        $users = User::query()
            ->with('profile:profile_id,user_id,first_name,last_name,profile_picture')
            ->where('username', 'LIKE', "%{$q}%")
            ->orWhereHas('profile', function ($query) use ($q) {
                $query->where('first_name', 'LIKE', "%{$q}%")
                    ->orWhere('last_name', 'LIKE', "%{$q}%");
            })
            ->select('user_id', 'username')
            ->limit(10)
            ->get();

        $communities = Community::query()
            ->where('name', 'LIKE', "%{$q}%")
            ->orWhere('description', 'LIKE', "%{$q}%")
            ->with('category:category_id,name,slug')
            ->limit(10)
            ->get();

        // Strip '#' if the user clicked a hashtag link
        $cleanQ = ltrim($q, '#');

        $posts = Post::query()
            ->where('privacy', 'public')
            ->where(function ($query) use ($q, $cleanQ) {
                $query->where('content', 'LIKE', "%{$q}%")
                    ->orWhereHas('hashtags', function ($q2) use ($cleanQ) {
                        $q2->where('name', 'LIKE', "%{$cleanQ}%");
                    })
                    ->orWhereHas('mood', function ($q3) use ($q) {
                        $q3->where('name', 'LIKE', "%{$q}%");
                    });
            })
            ->with([
                'user:user_id,username',
                'user.profile:profile_id,user_id,profile_picture',
                'community:community_id,name',
                'community.category:category_id,slug,name',
                'mood:mood_id,name',
                'hashtags:hashtag_id,name',
            ])
            ->limit(10)
            ->get();

        return response()->json([
            'users' => $users,
            'communities' => $communities,
            'posts' => $posts,
        ]);
    }
}
