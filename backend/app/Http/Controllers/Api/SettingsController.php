<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SettingsController extends Controller
{
    private function ensureSetting(Request $request)
    {
        return $request->user()->setting()->firstOrCreate(
            ['user_id' => $request->user()->user_id],
            [
                'default_post_privacy' => 'public',
                'hide_comments' => false,
                'show_reaction_counts' => true,
                'notify_likes' => true,
                'notify_comments' => true,
                'email_notifications' => true,
                'two_factor_enabled' => false,
            ]
        );
    }

    public function updateAccount(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255', 'unique:users,username,'.$request->user()->user_id.',user_id'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$request->user()->user_id.',user_id'],
            'phone_number' => ['nullable', 'string', 'max:30'],
        ]);

        $request->user()->update($validated);

        return response()->json($request->user());
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            return response()->json([
                'message' => 'Current password is incorrect.',
            ], 422);
        }

        $request->user()->update([
            'password' => $validated['new_password'],
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function updateTwoFactor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'two_factor_enabled' => ['required', 'boolean'],
        ]);

        $setting = $this->ensureSetting($request);
        $setting->update($validated);

        return response()->json($setting);
    }

    public function updatePrivacy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'default_post_privacy' => ['required', 'in:public,private'],
            'hide_comments' => ['required', 'boolean'],
            'show_reaction_counts' => ['required', 'boolean'],
        ]);

        $setting = $this->ensureSetting($request);
        $setting->update($validated);

        return response()->json($setting);
    }

    public function updateNotifications(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notify_likes' => ['required', 'boolean'],
            'notify_comments' => ['required', 'boolean'],
            'email_notifications' => ['required', 'boolean'],
        ]);

        $setting = $this->ensureSetting($request);
        $setting->update($validated);

        return response()->json($setting);
    }

    public function destroyAccount(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'Account deleted successfully.',
        ]);
    }
}
