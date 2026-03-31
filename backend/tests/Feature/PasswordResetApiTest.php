<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class PasswordResetApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_forgot_password_sends_reset_link_for_valid_email(): void
    {
        $user = User::factory()->create([
            'email' => 'forgot@example.com',
        ]);

        Notification::fake();

        $response = $this->postJson('/api/auth/forgot-password', [
            'email' => $user->email,
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Password reset link sent successfully.');

        Notification::assertSentTo(
            $user,
            ResetPassword::class,
            function (ResetPassword $notification) use ($user): bool {
                $mailMessage = $notification->toMail($user);

                return str_contains((string) $mailMessage->actionUrl, '/reset-password?')
                    && str_contains((string) $mailMessage->actionUrl, 'token=')
                    && str_contains((string) $mailMessage->actionUrl, 'email='.urlencode($user->email));
            }
        );

        $this->assertDatabaseHas('password_reset_tokens', [
            'email' => $user->email,
        ]);
    }

    public function test_reset_password_updates_password_when_token_is_valid(): void
    {
        $user = User::factory()->create([
            'email' => 'validreset@example.com',
            'password' => 'OldPass123!',
        ]);

        $token = Password::broker()->createToken($user);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewPass123!',
            'password_confirmation' => 'NewPass123!',
        ]);

        $response
            ->assertOk()
            ->assertJsonPath('message', 'Password has been reset successfully.');

        $user->refresh();

        $this->assertTrue(Hash::check('NewPass123!', $user->password));
        $this->assertFalse(Hash::check('OldPass123!', $user->password));

        $this->assertDatabaseMissing('password_reset_tokens', [
            'email' => $user->email,
        ]);
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $user = User::factory()->create([
            'email' => 'invalidtoken@example.com',
        ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => 'invalid-token',
            'password' => 'NewPass123!',
            'password_confirmation' => 'NewPass123!',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'This password reset token is invalid or expired.');
    }

    public function test_reset_password_fails_with_expired_token(): void
    {
        $user = User::factory()->create([
            'email' => 'expiredtoken@example.com',
            'password' => 'OldPass123!',
        ]);

        $token = Password::broker()->createToken($user);

        DB::table('password_reset_tokens')
            ->where('email', $user->email)
            ->update([
                'created_at' => now()->subMinutes((int) config('auth.passwords.users.expire') + 1),
            ]);

        $response = $this->postJson('/api/auth/reset-password', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'NewPass123!',
            'password_confirmation' => 'NewPass123!',
        ]);

        $response
            ->assertStatus(422)
            ->assertJsonPath('message', 'This password reset token is invalid or expired.');

        $user->refresh();
        $this->assertTrue(Hash::check('OldPass123!', $user->password));
    }
}
