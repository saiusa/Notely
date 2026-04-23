<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\CommunityMember;
use App\Models\Notification;
use App\Models\Post;
use App\Models\Report;
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
            ->with([
                'user' => function ($query) {
                    $query->select('user_id', 'username')
                        ->with('profile:user_id,profile_picture');
                },
                'replies' => function ($query) {
                    $query->with([
                        'user' => function ($userQuery) {
                            $userQuery->select('user_id', 'username')
                                ->with('profile:user_id,profile_picture');
                        }
                    ])->orderBy('created_at');
                }
            ])
            ->whereNull('parent_id')  // Only get top-level comments
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
            'parent_id' => ['nullable', 'exists:comments,comment_id'],
        ]);

        $comment = $post->comments()->create([
            'user_id' => $request->user()->user_id,
            'content' => $validated['content'],
            'parent_id' => $validated['parent_id'] ?? null,
        ]);

        // Commenting on a post counts as viewing it
        $post->increment('views_count');


        // Notify post owner about top-level comments
        if ((int) $post->user_id !== (int) $request->user()->user_id && ! $comment->parent_id) {
            Notification::create([
                'user_id' => $post->user_id,
                'type' => 'comment',
                'reference_id' => $comment->comment_id,
                'is_read' => false,
            ]);
        }

        // Notify parent comment author about replies
        if ($comment->parent_id) {
            $parentComment = Comment::find($comment->parent_id);
            if ($parentComment && (int) $parentComment->user_id !== (int) $request->user()->user_id) {
                Notification::create([
                    'user_id' => $parentComment->user_id,
                    'type' => 'reply',
                    'reference_id' => $comment->comment_id,
                    'is_read' => false,
                ]);
            }
        }

        $comment->load([
            'user' => function ($query) {
                $query->select('user_id', 'username')
                    ->with('profile:user_id,profile_picture');
            }
        ]);

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

    public function update(Request $request, Post $post, Comment $comment): JsonResponse
    {
        if ((int) $comment->post_id !== (int) $post->post_id) {
            return response()->json([
                'message' => 'Comment not found for this post.',
            ], 404);
        }

        $userId = (int) $request->user()->user_id;
        if ((int) $comment->user_id !== $userId) {
            return response()->json([
                'message' => 'You can only edit your own comments.',
            ], 403);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $comment->update(['content' => $validated['content']]);

        $comment->load([
            'user' => function ($query) {
                $query->select('user_id', 'username')
                    ->with('profile:user_id,profile_picture');
            }
        ]);

        return response()->json($comment);
    }

    public function report(Request $request, Post $post, Comment $comment): JsonResponse
    {
        if ((int) $comment->post_id !== (int) $post->post_id) {
            return response()->json([
                'message' => 'Comment not found for this post.',
            ], 404);
        }

        if (! $this->canInteractWithPost($request, $post)) {
            return response()->json([
                'message' => 'You are not allowed to report comments on this post.',
            ], 403);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:spam,inappropriate,harassment,misinformation,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        // Check if user has already reported this comment
        $existingReport = Report::where('user_id', $request->user()->user_id)
            ->where('comment_id', $comment->comment_id)
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'You have already reported this comment.',
            ], 422);
        }

        $report = Report::create([
            'user_id' => $request->user()->user_id,
            'comment_id' => $comment->comment_id,
            'post_id' => $post->post_id,
            'report_type' => 'comment',
            'reason' => $validated['reason'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'message' => 'Comment reported successfully.',
            'report_id' => $report->report_id,
        ], 201);
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
