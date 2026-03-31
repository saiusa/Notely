<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommunityMember;
use App\Models\Notification;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostCommentController extends Controller
{
    public function index(Request $request, Post $post): JsonResponse
    {
        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to access comments for this post.',
            ], 403);
        }

        $comments = $post->comments()
            ->with('user:user_id,username')
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json($comments);
    }

    public function store(Request $request, Post $post): JsonResponse
    {
        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to comment on this post.',
            ], 403);
        }

        if (! $post->allow_comments) {
            return response()->json([
                'message' => 'Comments are disabled for this post.',
            ], 422);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->user_id,
            'content' => $validated['content'],
        ]);

        if ((int) $post->user_id !== (int) $request->user()->user_id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'comment',
                'reference_id' => $comment->comment_id,
                'is_read' => false,
            ]);
        }

        $comment->load('user:user_id,username');

        return response()->json($comment, 201);
    }

    public function destroy(Request $request, Post $post, Comment $comment): JsonResponse
    {
        if ((int) $comment->post_id !== (int) $post->post_id) {
            return response()->json([
                'message' => 'Comment not found for this post.',
            ], 404);
        }

        $userId = (int) $request->user()->user_id;
        $isCommentOwner = (int) $comment->user_id === $userId;
        $isPostOwner = (int) $post->user_id === $userId;

        if (! $isCommentOwner && ! $isPostOwner) {
            return response()->json([
                'message' => 'You are not allowed to delete this comment.',
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully.',
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
