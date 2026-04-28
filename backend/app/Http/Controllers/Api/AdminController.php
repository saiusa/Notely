<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Community;
use App\Models\Post;
use App\Models\Report;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * Get dashboard statistics and top posts
     */
    public function dashboard(Request $request): JsonResponse
    {
        $metrics = [
            'total_users'       => \App\Models\User::count(),
            'total_posts'       => \App\Models\Post::count(),
            'total_communities' => \App\Models\Community::count(),
            'total_reports'     => \App\Models\Report::count(),
            'timestamp'         => now()->toIso8601String(),
        ];

        $topPosts = \App\Models\Post::with([
            'user:user_id,username',
            'user.profile:profile_id,user_id,profile_picture'
        ])
        ->withCount(['likes', 'comments'])
        ->orderByRaw('(likes_count + comments_count) DESC')
        ->take(5)
        ->get()
        ->map(function ($post) {
            $post->total_engagement = $post->likes_count + $post->comments_count;
            return $post;
        });

        $chartData = collect(range(6, 0))->map(function($daysAgo) {
            $date = Carbon::now()->subDays($daysAgo)->toDateString();
            return [
                'name' => Carbon::parse($date)->format('M d'),
                'posts' => \App\Models\Post::whereDate('created_at', $date)->count(),
                'engagements' => \App\Models\Like::whereDate('created_at', $date)->count() + \App\Models\Comment::whereDate('created_at', $date)->count(),
            ];
        });

        return response()->json([
            'success'   => true,
            'metrics'   => $metrics,
            'topPosts'  => $topPosts,
            'chartData' => $chartData
        ], 200);
    }

    /**
     * Get paginated list of all users
     */
    public function users(Request $request): JsonResponse
    {
        $users = User::with('profile')->paginate(15);

        return response()->json([
            'success'    => true,
            'data'       => $users->items(),
            'pagination' => [
                'total'        => $users->total(),
                'per_page'     => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page'    => $users->lastPage(),
                'from'         => $users->firstItem(),
                'to'           => $users->lastItem(),
            ],
        ], 200);
    }

    /**
     * Toggle user suspended status
     */
    public function toggleStatus(User $user): JsonResponse
    {
        $user->is_suspended = ! $user->is_suspended;
        $user->save();

        if ($user->is_suspended) {
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }
            \Illuminate\Support\Facades\DB::table('sessions')->where('user_id', $user->user_id)->delete();
        }

        return response()->json([
            'success' => true,
            'message' => $user->is_suspended ? 'User suspended successfully' : 'User activated successfully',
            'user'    => [
                'user_id'      => $user->user_id,
                'username'     => $user->username,
                'is_suspended' => $user->is_suspended,
                'status'       => $user->is_suspended ? 'suspended' : 'active',
            ],
        ], 200);
    }

    /**
     * Suspend a user (explicit suspend — does not toggle).
     * Used by the moderation queue "Suspend" button.
     */
    public function suspendUser(User $user): JsonResponse
    {
        $user->is_suspended = true;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "User @{$user->username} has been suspended.",
            'user'    => [
                'user_id'      => $user->user_id,
                'username'     => $user->username,
                'is_suspended' => true,
                'status'       => 'suspended',
            ],
        ], 200);
    }

    // =========================================================================
    // Legacy flat-post moderation (kept for backwards compatibility)
    // =========================================================================

    /**
     * Get paginated list of posts for moderation (legacy flat feed).
     */
    public function moderationPosts(Request $request): JsonResponse
    {
        $posts = Post::with('user')
            ->withCount('reports')
            ->where(function ($query) {
                $query->where('privacy', 'public')
                      ->orWhereRaw('(SELECT COUNT(*) FROM reports WHERE reports.post_id = posts.post_id) > 0');
            })
            ->orderByDesc('reports_count')
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'success'    => true,
            'data'       => $posts->items(),
            'pagination' => [
                'total'        => $posts->total(),
                'per_page'     => $posts->perPage(),
                'current_page' => $posts->currentPage(),
                'last_page'    => $posts->lastPage(),
                'from'         => $posts->firstItem(),
                'to'           => $posts->lastItem(),
            ],
        ], 200);
    }

    // =========================================================================
    // NEW: User-centric moderation queue
    // =========================================================================

    /**
     * Get all users who have reported posts or reported comments,
     * grouped by user — each row includes their flagged posts AND flagged comments.
     *
     * Response shape per user:
     * {
     *   id, user_id, username, email, avatar, is_suspended, status,
     *   reported_posts: [ ...Post with reports_count ],
     *   reported_comments: [ ...Comment with reports_count + parent post title ]
     * }
     */
    public function moderationUsers(Request $request): JsonResponse
    {
        // Find users who have either a reported post OR a reported comment
        $users = User::with([
            // Eager-load posts that have at least one report, with the report count
            'posts' => function ($q) {
                $q->has('reports')
                  ->withCount('reports')
                  ->with(['user:user_id,username', 'user.profile:profile_id,user_id,profile_picture'])
                  ->orderByDesc('reports_count');
            },
            // Eager-load comments that have at least one report, with the report count
            // and the parent post for context (post title / post_id)
            'comments' => function ($q) {
                $q->has('reports')
                  ->withCount('reports')
                  ->with([
                      'post:post_id,title,content',
                      'user:user_id,username',
                      'user.profile:profile_id,user_id,profile_picture'
                  ])
                  ->orderByDesc('reports_count');
            },
            'profile:user_id,profile_picture',
        ])
        ->where(function ($q) {
            // User has at least one reported post OR one reported comment
            $q->whereHas('posts', fn ($p) => $p->has('reports'))
              ->orWhereHas('comments', fn ($c) => $c->has('reports'));
        })
        ->orderBy('username')
        ->get();

        // Shape the response for the frontend accordion
        $shaped = $users->map(function (User $user) {
            // Normalize post keys so frontend can use post_id consistently
            $reportedPosts = $user->posts->map(fn (Post $post) => [
                'post_id'        => $post->post_id,
                'id'             => $post->post_id,
                'title'          => $post->title,
                'content'        => $post->content,
                'image'          => $post->image,
                'privacy'        => $post->privacy,
                'reports_count'  => $post->reports_count,
                'created_at'     => $post->created_at,
                'user'           => $post->user,
            ]);

            $reportedComments = $user->comments->map(fn (Comment $comment) => [
                'comment_id'    => $comment->comment_id,
                'id'            => $comment->comment_id,
                'content'       => $comment->content,
                'reports_count' => $comment->reports_count,
                'created_at'    => $comment->created_at,
                'post'          => $comment->post ? [
                    'post_id' => $comment->post->post_id,
                    'title'   => $comment->post->title,
                    'content' => $comment->post->content,
                ] : null,
                'user'          => $comment->user,
            ]);

            return [
                'id'                => $user->user_id,
                'user_id'           => $user->user_id,
                'username'          => $user->username,
                'email'             => $user->email,
                'avatar'            => $user->profile?->profile_picture,
                'profile'           => $user->profile,
                'is_suspended'      => $user->is_suspended,
                'status'            => $user->is_suspended ? 'suspended' : 'active',
                'reported_posts'    => $reportedPosts,
                'reported_comments' => $reportedComments,
            ];
        });

        return response()->json([
            'success' => true,
            'data'    => $shaped,
            'meta'    => [
                'total_users'    => $shaped->count(),
                'total_flagged'  => $shaped->sum(fn ($u) => count($u['reported_posts']) + count($u['reported_comments'])),
            ],
        ], 200);
    }

    // =========================================================================
    // Post moderation actions
    // =========================================================================

    /**
     * Delete a post (soft delete)
     */
    public function deletePost(Post $post): JsonResponse
    {
        $postId   = $post->post_id;
        $username = $post->user?->username ?? 'Unknown';

        $post->delete();

        return response()->json([
            'success'          => true,
            'message'          => "Post by @{$username} has been deleted successfully.",
            'deleted_post_id'  => $postId,
        ], 200);
    }

    /**
     * Dismiss all reports for a post
     */
    public function dismissReports(Post $post): JsonResponse
    {
        $reportCount = $post->reports()->count();

        Report::where('post_id', $post->post_id)->delete();

        return response()->json([
            'success'                 => true,
            'message'                 => "Dismissed {$reportCount} report(s) for this post.",
            'dismissed_reports_count' => $reportCount,
            'post_id'                 => $post->post_id,
        ], 200);
    }

    // =========================================================================
    // Comment moderation actions (NEW)
    // =========================================================================

    /**
     * Admin: Delete a comment (hard delete, bypasses ownership check)
     */
    public function deleteComment(Comment $comment): JsonResponse
    {
        $commentId = $comment->comment_id;
        $username  = $comment->user?->username ?? 'Unknown';

        $comment->delete();

        return response()->json([
            'success'             => true,
            'message'             => "Comment by @{$username} has been deleted.",
            'deleted_comment_id'  => $commentId,
        ], 200);
    }

    /**
     * Admin: Dismiss all reports for a comment
     */
    public function dismissCommentReports(Comment $comment): JsonResponse
    {
        $reportCount = Report::where('comment_id', $comment->comment_id)->count();

        Report::where('comment_id', $comment->comment_id)->delete();

        return response()->json([
            'success'                 => true,
            'message'                 => "Dismissed {$reportCount} report(s) for this comment.",
            'dismissed_reports_count' => $reportCount,
            'comment_id'              => $comment->comment_id,
        ], 200);
    }
}
