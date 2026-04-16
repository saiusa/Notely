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
     * GET /api/search?q=query&type=all|posts|communities|users
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q');
        $type = $request->query('type', 'all');
        $page = $request->query('page', 1);

        if (!$query || strlen(trim($query)) < 2) {
            return response()->json([
                'message' => 'Search query must be at least 2 characters',
                'results' => [],
                'total' => 0,
            ], 422);
        }

        $results = [];
        $user = $request->user();

        // Search posts
        if (in_array($type, ['all', 'posts'])) {
            $posts = $this->searchPosts($query, $user);
            $results['posts'] = $posts->paginate(10, ['*'], 'page', $page);
        }

        // Search communities
        if (in_array($type, ['all', 'communities'])) {
            $communities = $this->searchCommunities($query);
            $results['communities'] = $communities->paginate(10, ['*'], 'page', $page);
        }

        // Search users
        if (in_array($type, ['all', 'users'])) {
            $users = $this->searchUsers($query);
            $results['users'] = $users->paginate(10, ['*'], 'page', $page);
        }

        return response()->json([
            'results' => $results,
            'query' => $query,
            'type' => $type,
        ]);
    }

    /**
     * Get search suggestions (autocomplete)
     * GET /api/search/suggestions?q=query
     */
    public function suggestions(Request $request): JsonResponse
    {
        $query = $request->query('q');

        if (!$query || strlen(trim($query)) < 2) {
            return response()->json(['suggestions' => []]);
        }

        $user = $request->user();

        // Get top 5 suggestions from each category
        $postSuggestions = $this->searchPosts($query, $user)
            ->limit(5)
            ->pluck('title', 'post_id')
            ->toArray();

        $communitySuggestions = $this->searchCommunities($query)
            ->limit(5)
            ->pluck('name', 'community_id')
            ->toArray();

        $userSuggestions = $this->searchUsers($query)
            ->limit(5)
            ->pluck('username', 'user_id')
            ->toArray();

        return response()->json([
            'suggestions' => [
                'posts' => array_values($postSuggestions),
                'communities' => array_values($communitySuggestions),
                'users' => array_values($userSuggestions),
            ],
        ]);
    }

    /**
     * Search posts with visibility checks
     */
    private function searchPosts(string $query, $user)
    {
        return Post::query()
            ->where('privacy', 'public')
            ->where(function (Builder $q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('content', 'LIKE', "%{$query}%");
            })
            ->where(function (Builder $q) use ($user) {
                // Show public posts or user's own posts or community member posts
                $q->where('privacy', 'public')
                  ->orWhere('user_id', $user?->user_id)
                  ->orWhereIn('community_id', function ($subquery) use ($user) {
                      $subquery->select('community_id')
                          ->from('community_members')
                          ->where('user_id', $user?->user_id);
                  });
            })
            ->with([
                'user:user_id,username',
                'community:community_id,name',
                'mood:mood_id,name,color',
                'hashtags:hashtag_id,name',
            ])
            ->orderByDesc('created_at');
    }

    /**
     * Search communities
     */
    private function searchCommunities(string $query)
    {
        return Community::query()
            ->where('name', 'LIKE', "%{$query}%")
            ->orWhere('description', 'LIKE', "%{$query}%")
            ->with('category:category_id,name')
            ->withCount('communityMembers')
            ->orderByDesc('created_at');
    }

    /**
     * Search users
     */
    private function searchUsers(string $query)
    {
        return User::query()
            ->where('username', 'LIKE', "%{$query}%")
            ->orWhere('email', 'LIKE', "%{$query}%")
            ->select('user_id', 'username', 'email', 'created_at')
            ->orderByDesc('created_at');
    }
}
