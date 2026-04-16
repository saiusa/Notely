<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use function base64_encode;
use function chr;
use function hash_hmac;
use function ord;
use function pack;
use function unpack;

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

    /**
     * Generate a random base32 secret for TOTP
     */
    private function generateTOTPSecret(): string
    {
        $secret = random_bytes(20);
        return strtr(base64_encode($secret), ['+' => '-', '/' => '_', '=' => '']) ?: '';
    }

    /**
     * Generate Google Authenticator QR Code data URI
     */
    private function generateQRCode(string $secret, string $email): string
    {
        $appName = 'Notely';
        $data = "otpauth://totp/{$appName}:{$email}?secret={$secret}&issuer={$appName}";
        
        // Use Google Charts API for QR code generation
        return 'https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=' . urlencode($data);
    }

    /**
     * Verify a TOTP code
     */
    private function verifyTOTP(string $secret, string $code, int $discrepancy = 1): bool
    {
        $base32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        $secret = strtoupper($secret);
        
        // Decode base32 secret
        $decoded = '';
        for ($i = 0; $i < strlen($secret); $i++) {
            $decoded .= sprintf('%05b', strpos($base32, $secret[$i]));
        }
        
        // Convert binary to bytes
        $bytes = '';
        for ($i = 0; $i < strlen($decoded); $i += 8) {
            $bytes .= chr(bindec(substr($decoded, $i, 8)));
        }
        
        // Check against current and adjacent time windows
        $currentTime = floor(time() / 30);
        
        for ($i = -$discrepancy; $i <= $discrepancy; $i++) {
            $time = $currentTime + $i;
            $timestamp = pack('N', 0) . pack('N', $time);
            $hash = hash_hmac('sha1', $timestamp, $bytes, true);
            $offset = ord($hash[19]) & 0x0F;
            $totp = (
                ((ord($hash[$offset]) & 0x7F) << 21) |
                ((ord($hash[$offset + 1]) & 0xFF) << 13) |
                ((ord($hash[$offset + 2]) & 0xFF) << 5) |
                ((ord($hash[$offset + 3]) & 0xFF) >> 3)
            ) % 1000000;
            
            if ((string)$totp === (string)$code) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Generate backup codes for 2FA
     */
    private function generateBackupCodes(int $count = 10): array
    {
        $codes = [];
        for ($i = 0; $i < $count; $i++) {
            $codes[] = bin2hex(random_bytes(4));
        }
        return $codes;
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

    public function setupTwoFactor(Request $request): JsonResponse
    {
        $secret = $this->generateTOTPSecret();
        $qrCode = $this->generateQRCode($secret, $request->user()->email);

        // Store temporary secret in session (not yet verified)
        session()->put('pending_2fa_secret', $secret);

        return response()->json([
            'secret' => $secret,
            'qr_code' => $qrCode,
        ]);
    }

    public function confirmTwoFactor(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'regex:/^\d{6}$/'],
        ]);

        $secret = session()->get('pending_2fa_secret');
        if (!$secret) {
            return response()->json([
                'message' => '2FA setup not initialized.',
            ], 422);
        }

        // Verify the code
        if (!$this->verifyTOTP($secret, $validated['code'])) {
            return response()->json([
                'message' => 'Invalid 2FA code.',
            ], 422);
        }

        // Generate backup codes
        $backupCodes = $this->generateBackupCodes();
        $backup_codes_hash = Hash::make(json_encode($backupCodes));

        // Enable 2FA on the user's setting
        $setting = $this->ensureSetting($request);
        $setting->update([
            'two_factor_enabled' => true,
            'two_factor_secret' => $secret,
            'two_factor_backup_codes' => $backup_codes_hash,
        ]);

        // Clear temporary session data
        session()->forget('pending_2fa_secret');

        return response()->json([
            'message' => '2FA enabled successfully.',
            'backup_codes' => $backupCodes,
        ]);
    }

    public function disableTwoFactor(Request $request): JsonResponse
    {
        $setting = $this->ensureSetting($request);
        $setting->update([
            'two_factor_enabled' => false,
            'two_factor_secret' => null,
            'two_factor_backup_codes' => null,
        ]);

        return response()->json([
            'message' => '2FA disabled successfully.',
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
