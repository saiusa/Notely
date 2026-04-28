<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name'   => ['required', 'string', 'max:255'],
            'last_name'    => ['required', 'string', 'max:255'],
            'username'     => ['required', 'string', 'max:30', 'unique:users,username', 'regex:/^[a-zA-Z0-9._]+$/'],
            'email'        => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'     => ['required', 'confirmed', Password::defaults()],
            'phone_number' => ['nullable', 'string', 'max:30'],
        ]);

        $user = User::create([
            'username'     => $validated['username'],
            'email'        => $validated['email'],
            'password'     => $validated['password'],
            'phone_number' => $validated['phone_number'] ?? null,
        ]);

        // Auto-create the user's profile with their name
        Profile::create([
            'user_id'    => $user->user_id,
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message'    => 'User registered successfully.',
            'user'       => $user->load('profile'),
            'token'      => $token,
            'token_type' => 'Bearer',
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'remember_me' => ['sometimes', 'boolean'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        if ($user->is_suspended) {
            return response()->json([
                'message' => 'Your account has been suspended by an administrator.',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        // Generate remember_token if remember_me checkbox is checked
        $rememberToken = null;
        if ($credentials['remember_me'] ?? false) {
            $rememberToken = Str::random(100);
            $user->update(['remember_token' => $rememberToken]);
        }

        return response()->json([
            'message' => 'Login successful.',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'remember_token' => $rememberToken,
        ]);
    }

    /**
     * Validate and auto-login using remember_token
     * POST /api/auth/remember-me/validate
     */
    public function validateRememberToken(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'remember_token' => ['required', 'string'],
        ]);

        // Find user with this remember_token
        $user = User::where('remember_token', $validated['remember_token'])->first();

        if (! $user) {
            return response()->json([
                'message' => 'Invalid or expired remember token.',
            ], 422);
        }

        // Generate new API token for this session
        $token = $user->createToken('auth_token')->plainTextToken;

        // Optionally generate a new remember_token for security (token rotation)
        $newRememberToken = Str::random(100);
        $user->update(['remember_token' => $newRememberToken]);

        return response()->json([
            'message' => 'Auto-login successful.',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
            'remember_token' => $newRememberToken,
        ]);
    }

    /**
     * Logout and clear remember_token
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        // Clear remember_token on logout for security
        $request->user()?->update(['remember_token' => null]);

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
