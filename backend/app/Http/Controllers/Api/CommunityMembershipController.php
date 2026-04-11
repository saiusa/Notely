<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommunityMembershipController extends Controller
{
    public function members(Community $community): JsonResponse
    {
        $members = $community->users()
            ->select('users.user_id', 'users.username', 'community_members.joined_at')
            ->orderByDesc('community_members.joined_at')
            ->paginate(20);

        return response()->json($members);
    }

    public function myCommunities(Request $request): JsonResponse
    {
        $userId = $request->user()->user_id;

        // Get communities created by user
        $created = Community::query()
            ->where('user_id', $userId)
            ->with('category:category_id,name,slug,image')
            ->withCount('communityMembers')
            ->get()
            ->map(fn($c) => $c->toArray() + ['type' => 'created']);

        // Get communities user joined
        $joined = $request->user()->communities()
            ->with('category:category_id,name,slug,image')
            ->withCount('communityMembers')
            ->withPivot('joined_at')
            ->get()
            ->map(fn($c) => $c->toArray() + ['type' => 'joined']);

        return response()->json([
            'created' => $created,
            'joined' => $joined,
        ]);
    }

    public function join(Request $request, Community $community): JsonResponse
    {
        $membership = CommunityMember::firstOrCreate([
            'user_id' => $request->user()->user_id,
            'community_id' => $community->community_id,
        ], [
            'joined_at' => now(),
        ]);

        if ($membership->wasRecentlyCreated) {
            Notification::create([
                'user_id' => $request->user()->user_id,
                'type' => 'community',
                'reference_id' => $community->community_id,
                'is_read' => false,
            ]);
        }

        return response()->json([
            'message' => 'Joined community successfully.',
            'membership' => $membership,
        ], 201);
    }

    public function leave(Request $request, Community $community): JsonResponse
    {
        CommunityMember::query()
            ->where('user_id', $request->user()->user_id)
            ->where('community_id', $community->community_id)
            ->delete();

        return response()->json([
            'message' => 'Left community successfully.',
        ]);
    }
}
