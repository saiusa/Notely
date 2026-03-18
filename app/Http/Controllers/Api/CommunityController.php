<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Post;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityController extends Controller
{
    public function index(): JsonResponse
    {
        $communities = Community::query()
            ->withCount('communityMembers')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($communities);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
        ]);

        $community = Community::create($validated);

        return response()->json($community, 201);
    }

    public function show(Community $community): JsonResponse
    {
        $community->loadCount('communityMembers');

        return response()->json($community);
    }

    public function posts(Request $request, Community $community): JsonResponse
    {
        $user = $request->user();
        $isMember = CommunityMember::query()
            ->where('user_id', $user->user_id)
            ->where('community_id', $community->community_id)
            ->exists();

        $posts = Post::query()
            ->where('community_id', $community->community_id)
            ->where(function (Builder $query) use ($user, $isMember): void {
                $query->where('privacy', 'public')
                    ->orWhere('user_id', $user->user_id);

                if ($isMember) {
                    $query->orWhere('privacy', 'private');
                }
            })
            ->with([
                'user:user_id,username',
                'community:community_id,name',
                'mood:mood_id,name,color',
                'hashtags:hashtag_id,name',
            ])
            ->withCount(['comments', 'likes'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json($posts);
    }
}
