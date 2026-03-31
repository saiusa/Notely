<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityMember;
use App\Models\Post;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function myReports(Request $request): JsonResponse
    {
        $reports = Report::query()
            ->where('user_id', $request->user()->user_id)
            ->with('post:post_id,user_id,privacy,content')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($reports);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to report this post.',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string'],
        ]);

        $report = Report::firstOrCreate([
            'user_id' => $request->user()->user_id,
            'post_id' => $post->post_id,
        ], [
            'reason' => $validated['reason'],
        ]);

        return response()->json($report, 201);
    }

    public function destroy(Request $request, Report $report): JsonResponse
    {
        if ((int) $report->user_id !== (int) $request->user()->user_id) {
            return response()->json([
                'message' => 'You can only delete your own reports.',
            ], 403);
        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully.',
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
