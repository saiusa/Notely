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
     */
    public function showPublicProfile(string $username): JsonResponse
    {
        $user = User::where('username', $username)
            ->with(['profile'])
            ->firstOrFail();

        return response()->json($user);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'birthday' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $profile = $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->user_id],
            $validated
        );

        return response()->json($profile);
    }

    public function updateWithFiles(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'birthday' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'profile_picture' => ['nullable', 'image', 'max:5120'],
            'cover_photo' => ['nullable', 'image', 'max:5120'],
        ]);

        $userDir = 'profiles/' . $request->user()->user_id;

        // Handle profile picture
        if ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'profile_' . time() . '.' . $file->getClientOriginalExtension();
            $path = Storage::disk('public')->putFileAs($userDir, $file, $filename);
            $validated['profile_picture'] = Storage::disk('public')->url($path);
        }

        // Handle cover photo
        if ($request->hasFile('cover_photo')) {
            $file = $request->file('cover_photo');
            $filename = 'cover_' . time() . '.' . $file->getClientOriginalExtension();
            $path = Storage::disk('public')->putFileAs($userDir, $file, $filename);
            $validated['cover_photo'] = Storage::disk('public')->url($path);
        }

        $profile = $request->user()->profile()->updateOrCreate(
            ['user_id' => $request->user()->user_id],
            $validated
        );

        return response()->json($profile);
    }
}
