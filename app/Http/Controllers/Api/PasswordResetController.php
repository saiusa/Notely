<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Throwable;

class PasswordResetController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        try {
            $status = Password::sendResetLink([
                'email' => $validated['email'],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to process password reset request at the moment. Please try again later.',
            ], 503);
        }

        return match ($status) {
            Password::RESET_LINK_SENT => response()->json([
                'message' => 'Password reset link sent successfully.',
            ]),
            Password::INVALID_USER => response()->json([
                // Intentionally generic to avoid user enumeration.
                'message' => 'If the email exists, a password reset link has been sent.',
            ]),
            Password::RESET_THROTTLED => response()->json([
                'message' => 'Please wait before requesting another reset link.',
            ], 429),
            default => response()->json([
                'message' => 'Unable to send password reset link.',
            ], 400),
        };
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'token' => ['required', 'string'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        try {
            $status = Password::reset(
                [
                    'email' => $validated['email'],
                    'token' => $validated['token'],
                    'password' => $validated['password'],
                    'password_confirmation' => $request->input('password_confirmation'),
                ],
                function (User $user, string $password): void {
                    $updates = [
                        'password' => Hash::make($password),
                    ];

                    if (Schema::hasColumn($user->getTable(), 'remember_token')) {
                        $updates['remember_token'] = null;
                    }

                    $user->forceFill($updates)->save();

                    event(new PasswordReset($user));
                }
            );
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'message' => 'Unable to reset password right now. Please try again later.',
            ], 503);
        }

        return match ($status) {
            Password::PASSWORD_RESET => response()->json([
                'message' => 'Password has been reset successfully.',
            ]),
            Password::INVALID_TOKEN => response()->json([
                'message' => 'This password reset token is invalid or expired.',
            ], 422),
            default => response()->json([
                'message' => 'Unable to reset password with provided details.',
            ], 422),
        };
    }
}
