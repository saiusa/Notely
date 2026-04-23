<?php

namespace App\Http\Controllers\Api;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class JournalController extends Controller
{
    /**
     * Get the authenticated user's 5 most recent journals
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function recent(Request $request): JsonResponse
    {
        try {
            $userId = $request->user()->user_id;

            $journals = Post::where('user_id', $userId)
                ->with([
                    'user:user_id,username',
                    'user.profile:user_id,profile_picture',
                ])
                ->orderBy('created_at', 'desc')
                ->take(5)
                ->get()
                ->map(function ($journal) {
                    return [
                        'id' => $journal->post_id,
                        'user_id' => $journal->user_id,
                        'user' => [
                            'user_id' => $journal->user->user_id,
                            'username' => $journal->user->username,
                            'profile' => [
                                'profile_picture' => $journal->user->profile?->profile_picture,
                            ],
                        ],
                        'content' => $journal->content,
                        'body_text' => $journal->content, // Alias for frontend compatibility
                        'image' => $journal->image,
                        'created_at' => $journal->created_at?->toIso8601String(),
                        'type' => $journal->type,
                        'title' => $journal->title,
                    ];
                });

            return response()->json($journals);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch recent journals:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Failed to fetch journals'], 500);
        }
    }

}
