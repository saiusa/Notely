<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AdminSettingController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\CommunityMembershipController;
use App\Http\Controllers\Api\EmailNotificationController;
use App\Http\Controllers\Api\FileUploadController;
use App\Http\Controllers\Api\JournalController;
use App\Http\Controllers\Api\MeController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PostCommentController;
use App\Http\Controllers\Api\PostController;
use App\Http\Controllers\Api\PostLikeController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;use App\Http\Controllers\Api\SearchController;use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

// ─── PUBLIC: system status (no auth, used by SystemStateWrapper) ─────────────
Route::get('/system-status', [AdminSettingController::class, 'publicStatus']);

Route::prefix('auth')->group(function (): void {
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1'); // 5 attempts per minute
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1'); // 10 attempts per minute
    Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword'])->middleware('throttle:3,1'); // 3 attempts per minute
    Route::post('/reset-password', [PasswordResetController::class, 'resetPassword'])->middleware('throttle:3,1');
    
    // ────── Remember Me (Auto-login) ──────
    Route::post('/remember-me/validate', [AuthController::class, 'validateRememberToken'])->middleware('throttle:10,1');

    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/me', [MeController::class, 'show']);
    Route::put('/me/profile', [ProfileController::class, 'update']);
    
    // Get public user profile by username
    Route::get('/users/{username}/profile', [ProfileController::class, 'showPublicProfile']);
    
    // ─── Settings Routes ──────────────────────────
    Route::put('/me/settings/account', [SettingsController::class, 'updateAccount']);
    Route::put('/me/settings/security/password', [SettingsController::class, 'updatePassword']);
    Route::put('/me/settings/security/two-factor', [SettingsController::class, 'updateTwoFactor']);
    Route::post('/me/settings/security/two-factor/setup', [SettingsController::class, 'setupTwoFactor']);
    Route::post('/me/settings/security/two-factor/confirm', [SettingsController::class, 'confirmTwoFactor']);
    Route::delete('/me/settings/security/two-factor', [SettingsController::class, 'disableTwoFactor']);
    Route::put('/me/settings/privacy', [SettingsController::class, 'updatePrivacy']);
    Route::put('/me/settings/notifications', [SettingsController::class, 'updateNotifications']);
    Route::delete('/me', [SettingsController::class, 'destroyAccount']);

    Route::post('/uploads', [FileUploadController::class, 'upload']);

    // ─── Posts Routes ──────────────────────────
    Route::get('/posts', [PostController::class, 'index']);
    Route::get('/posts/explore', [PostController::class, 'explore']);
    Route::get('/posts/journal/private', [PostController::class, 'privateJournal']);
    Route::get('/posts/journal/public', [PostController::class, 'publicJournal']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::get('/posts/{post}', [PostController::class, 'show']);
    Route::put('/posts/{post}', [PostController::class, 'update']);
    Route::patch('/posts/{post}', [PostController::class, 'update']);
    Route::delete('/posts/{post}', [PostController::class, 'destroy']);

    Route::get('/posts/{post}/comments', [PostCommentController::class, 'index']);
    Route::post('/posts/{post}/comments', [PostCommentController::class, 'store']);
    Route::put('/posts/{post}/comments/{comment}', [PostCommentController::class, 'update']);
    Route::delete('/posts/{post}/comments/{comment}', [PostCommentController::class, 'destroy']);
    Route::post('/posts/{post}/comments/{comment}/reports', [PostCommentController::class, 'report']);

    Route::get('/posts/{post}/likes', [PostLikeController::class, 'index']);
    Route::post('/posts/{post}/likes', [PostLikeController::class, 'store']);
    Route::delete('/posts/{post}/likes', [PostLikeController::class, 'destroy']);

    Route::post('/posts/{post}/reports', [ReportController::class, 'store']);
    Route::get('/reports/me', [ReportController::class, 'myReports']);
    Route::delete('/reports/{report}', [ReportController::class, 'destroy']);

    // ─── Journal Routes ──────────────────────────
    Route::get('/journals/recent', [JournalController::class, 'recent']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('/notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{notification}', [NotificationController::class, 'destroy']);

    // ─── Community Routes ──────────────────────────
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    Route::get('/communities', [CommunityController::class, 'index']);
    Route::post('/communities', [CommunityController::class, 'store']);
    Route::put('/communities/{community}', [CommunityController::class, 'update']);
    Route::patch('/communities/{community}', [CommunityController::class, 'update']);
    Route::get('/communities/me', [CommunityMembershipController::class, 'myCommunities']);
    Route::get('/communities/{community}', [CommunityController::class, 'show']);
    Route::get('/communities/{community}/posts', [CommunityController::class, 'posts']);

    Route::get('/communities/{community}/members', [CommunityMembershipController::class, 'members']);
    Route::post('/communities/{community}/join', [CommunityMembershipController::class, 'join']);
    Route::delete('/communities/{community}/leave', [CommunityMembershipController::class, 'leave']);

    // ─── Search Routes ───────────────────────────
    Route::get('/search', [SearchController::class, 'search']);
    Route::get('/search/suggestions', [SearchController::class, 'suggestions']);

    // ─── Email Notification Routes ───────────────
    Route::prefix('email-notifications')->group(function (): void {
        Route::get('/preferences', [EmailNotificationController::class, 'getPreferences']);
        Route::put('/preferences', [EmailNotificationController::class, 'updatePreferences']);
        Route::post('/send-test', [EmailNotificationController::class, 'sendTestEmail']);
    });
});

// ─── ADMIN ROUTES ─────────────────────────────────────
// Protected by both 'auth:sanctum' and 'admin' middleware
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function (): void {
    // Stats & users
    Route::get('/stats', [AdminController::class, 'getStats']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::patch('/users/{user}/toggle-status', [AdminController::class, 'toggleStatus']);
    Route::post('/users/{user}/suspend', [AdminController::class, 'suspendUser']);

    // Moderation — legacy flat post feed
    Route::get('/moderation/posts', [AdminController::class, 'moderationPosts']);

    // Moderation — NEW user-centric queue
    Route::get('/moderation/users', [AdminController::class, 'moderationUsers']);

    // Post moderation actions
    Route::delete('/posts/{post}', [AdminController::class, 'deletePost']);
    Route::post('/posts/{post}/dismiss-reports', [AdminController::class, 'dismissReports']);

    // Comment moderation actions (NEW)
    Route::delete('/comments/{comment}', [AdminController::class, 'deleteComment']);
    Route::post('/comments/{comment}/dismiss-reports', [AdminController::class, 'dismissCommentReports']);

    // System settings
    Route::get('/settings',  [AdminSettingController::class, 'index']);
    Route::put('/settings',  [AdminSettingController::class, 'update']);
});

// ─── Public unsubscribe link (no auth required) ────────
Route::post('/email-notifications/unsubscribe/{token?}', [EmailNotificationController::class, 'unsubscribe']);
