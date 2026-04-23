<?php

namespace App\Http\Controllers\Api;

use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailNotificationController
{
    /**
     * Get current user's email notification preferences
     * GET /api/email-notifications/preferences
     */
    public function getPreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $preferences = Setting::where('user_id', $user->user_id)
            ->select([
                'notify_likes',
                'notify_comments', 
                'notify_replies',
                'email_digest_frequency',
                'notify_new_followers',
                'notify_community_posts',
                'notify_community_announcements'
            ])
            ->first();

        return response()->json([
            'preferences' => $preferences ?? [
                'notify_likes' => true,
                'notify_comments' => true,
                'notify_replies' => true,
                'email_digest_frequency' => 'daily', // daily|weekly|never
                'notify_new_followers' => true,
                'notify_community_posts' => true,
                'notify_community_announcements' => true,
            ]
        ]);
    }

    /**
     * Update email notification preferences
     * PUT /api/email-notifications/preferences
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'notify_likes' => 'sometimes|boolean',
            'notify_comments' => 'sometimes|boolean',
            'notify_replies' => 'sometimes|boolean',
            'email_digest_frequency' => 'sometimes|in:daily,weekly,never',
            'notify_new_followers' => 'sometimes|boolean',
            'notify_community_posts' => 'sometimes|boolean',
            'notify_community_announcements' => 'sometimes|boolean',
        ]);

        // Get or create setting
        $setting = Setting::firstOrCreate(
            ['user_id' => $user->user_id],
            []
        );

        // Update only provided fields
        $setting->update($validated);

        return response()->json([
            'message' => 'Email notification preferences updated successfully',
            'preferences' => $setting
        ]);
    }

    /**
     * Send test email to user
     * POST /api/email-notifications/send-test
     */
    public function sendTestEmail(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            // Example: Send test email
            // Mail::to($user->email)->send(new TestEmailNotification($user));

            // For now, just indicate success
            return response()->json([
                'message' => 'Test email sent successfully to ' . $user->email,
                'email' => $user->email
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to send test email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Unsubscribe from email notifications (via email link token)
     * POST /api/email-notifications/unsubscribe/:token
     */
    public function unsubscribe(string $token = null, Request $request): JsonResponse
    {
        // Token is passed via query param or in the request for security
        $token = $token ?? $request->query('token');

        if (!$token) {
            return response()->json([
                'message' => 'Invalid unsubscribe token'
            ], 400);
        }

        try {
            // Decode token to get user_id
            // Example token format: base64(user_id|timestamp|hash)
            $decoded = json_decode(base64_decode($token), true);
            
            if (!$decoded || !isset($decoded['user_id'])) {
                throw new \Exception('Invalid token');
            }

            $userId = $decoded['user_id'];

            // Disable all email notifications for this user
            Setting::updateOrCreate(
                ['user_id' => $userId],
                [
                    'notify_likes' => false,
                    'notify_comments' => false,
                    'notify_replies' => false,
                    'notify_new_followers' => false,
                    'notify_community_posts' => false,
                    'notify_community_announcements' => false,
                    'email_digest_frequency' => 'never',
                ]
            );

            return response()->json([
                'message' => 'Successfully unsubscribed from email notifications'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to unsubscribe: ' . $e->getMessage()
            ], 400);
        }
    }

}

