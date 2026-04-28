<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Get a user's public profile by username
     * GET /api/users/{username}/profile
     *
     * Eager-loads the profile relation AND public posts (latest first)
     * so the frontend can display them without a second request.
     */
    public function showPublicProfile(string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->with([
                'profile',
                'communities:community_id,name,image',
                'communities.category:category_id,slug,name',
                'posts' => function ($q) {
                    $q->where('privacy', 'public')
                        ->with([
                            'user:user_id,username',
                            'user.profile:profile_id,user_id,profile_picture',
                            'user.setting:user_id,show_reaction_counts,hide_comments',
                            'community:community_id,name,category_id',
                            'community.category:category_id,slug,name',
                            'mood:mood_id,name,color',
                            'hashtags:hashtag_id,name',
                        ])
                        ->withCount(['comments', 'likes'])
                        ->latest();
                },
            ])
            ->firstOrFail();

        return response()->json($user);
    }

    /**
     * Update authenticated user's profile
     * PUT /api/me/profile  (also accepts POST with _method=PUT for file uploads)
     *
     * Handles both text fields AND file uploads (profile_picture, cover_photo)
     * via multipart/form-data.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'birthday' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'profile_picture' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,mp4,mov', 'max:51200'],
            'cover_photo' => ['nullable', 'file', 'image', 'mimes:jpeg,png,jpg,gif,mp4,mov', 'max:51200'],
        ]);

        // Remove file fields from $validated — we handle them separately
        unset($validated['profile_picture'], $validated['cover_photo']);

        $profile = $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->user_id],
            $validated
        );

        // Handle profile picture upload
        if ($request->hasFile('profile_picture')) {
            // Delete old file if it exists
            if ($profile->profile_picture && Storage::disk('public')->exists($profile->profile_picture)) {
                Storage::disk('public')->delete($profile->profile_picture);
            }

            $filename = time() . '_avatar_' . uniqid() . '.' . $request->file('profile_picture')->getClientOriginalExtension();
            $path = $request->file('profile_picture')->storeAs('avatars', $filename, 'public');
            $profile->update(['profile_picture' => '/storage/' . $path]);
        }

        // Handle cover photo upload
        if ($request->hasFile('cover_photo')) {
            // Delete old file if it exists
            if ($profile->cover_photo && Storage::disk('public')->exists($profile->cover_photo)) {
                Storage::disk('public')->delete($profile->cover_photo);
            }

            $filename = time() . '_cover_' . uniqid() . '.' . $request->file('cover_photo')->getClientOriginalExtension();
            $path = $request->file('cover_photo')->storeAs('covers', $filename, 'public');
            $profile->update(['cover_photo' => '/storage/' . $path]);
        }

        return response()->json($profile->fresh());
    }
}
