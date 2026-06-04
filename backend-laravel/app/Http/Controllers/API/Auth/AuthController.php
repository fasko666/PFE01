<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use App\Http\Controllers\API\Notifications\NotificationController;

class AuthController extends Controller
{
    // ─── Register ────────────────────────────────────────────────────────────

    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'role'     => 'required|in:freelancer,client',
            'country'  => 'nullable|string',
            'avatar'   => 'nullable|string', // base64 data-uri
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $avatarPath = null;
        if ($request->filled('avatar')) {
            $avatarPath = $this->saveBase64Avatar($request->avatar);
        }

        // Use forceFill for guarded fields (role, email_verified_at) — explicit,
        // audited path. Validation above already restricted role to freelancer|client.
        $user = (new User)->forceFill([
            'name'              => $request->name,
            'username'          => $this->generateUsername($request->name),
            'email'             => $request->email,
            'password'          => Hash::make($request->password),
            'role'              => $request->role,
            'country'           => $request->country,
            'avatar'            => $avatarPath,
            'email_verified_at' => now(),
            'is_active'         => true,
        ]);
        $user->save();

        if ($user->isFreelancer()) {
            $user->freelancerProfile()->create([]);
        } else {
            $user->clientProfile()->create([]);
        }

        Wallet::create(['user_id' => $user->id]);
        // connects_balance defaults to 10 via the users migration; nothing else needed for the free tier

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ], 201);
    }

    // ─── Login ───────────────────────────────────────────────────────────────

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $user = User::with(['freelancerProfile', 'clientProfile', 'subscription', 'wallet'])->find(Auth::id());

        // Banned account check — refuse login and do not issue token
        if (!$user->is_active) {
            Auth::logout();
            return response()->json(['message' => 'This account has been suspended. Contact support.'], 403);
        }

        // 2FA gate — if enabled, require a TOTP/recovery code in the same request
        if ($user->two_factor_confirmed_at) {
            $code = (string) $request->input('two_factor_code', '');
            if ($code === '') {
                Auth::logout();
                return response()->json([
                    'message'             => 'Two-factor code required.',
                    'requires_two_factor' => true,
                ], 422);
            }
            $totp   = app(\App\Services\TotpService::class);
            $secret = \Illuminate\Support\Facades\Crypt::decryptString($user->two_factor_secret);
            $valid  = $totp->verify($secret, $code);
            if (! $valid) {
                // Try recovery code as fallback
                $codes = $user->two_factor_recovery_codes
                    ? (json_decode(\Illuminate\Support\Facades\Crypt::decryptString($user->two_factor_recovery_codes), true) ?: [])
                    : [];
                $idx = array_search(strtoupper(trim($code)), array_map('strtoupper', $codes), true);
                if ($idx === false) {
                    Auth::logout();
                    return response()->json(['message' => 'Invalid two-factor code.', 'requires_two_factor' => true], 422);
                }
                // consume recovery code
                unset($codes[$idx]);
                $user->forceFill(['two_factor_recovery_codes' => \Illuminate\Support\Facades\Crypt::encryptString(json_encode(array_values($codes)))])->save();
            }
        }

        $user->update(['is_online' => true, 'last_seen_at' => now()]);

        $token = $user->createToken('auth_token')->plainTextToken;

        NotificationController::seedForUser($user->id, get_class($user), $user->role);

        return response()->json([
            'message' => 'Login successful',
            'user'    => $this->formatUser($user),
            'token'   => $token,
        ]);
    }

    // ─── Logout ──────────────────────────────────────────────────────────────

    public function logout(Request $request): JsonResponse
    {
        $request->user()->update(['is_online' => false, 'last_seen_at' => now()]);
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // ─── Me ──────────────────────────────────────────────────────────────────

    public function me(Request $request): JsonResponse
    {
        $user = User::with(['freelancerProfile', 'clientProfile', 'subscription', 'wallet', 'skills.category'])
            ->find($request->user()->id);
        return response()->json(['user' => $this->formatUser($user)]);
    }

    // ─── Update profile ──────────────────────────────────────────────────────

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $validator = Validator::make($request->all(), [
            'name'     => 'sometimes|string|max:255',
            'username' => 'sometimes|string|unique:users,username,' . $user->id,
            'country'  => 'sometimes|string',
            'timezone' => 'sometimes|string',
            'phone'    => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user->update($validator->validated());

        if ($user->isFreelancer() && $request->has('profile')) {
            $user->freelancerProfile->update($request->profile);
        }
        if ($user->isClient() && $request->has('profile')) {
            $user->clientProfile->update($request->profile);
        }

        return response()->json([
            'message' => 'Profile updated',
            'user'    => $this->formatUser($user->fresh(['freelancerProfile', 'clientProfile'])),
        ]);
    }

    // ─── Change password ─────────────────────────────────────────────────────

    public function changePassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required',
            'password'         => 'required|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $request->user()->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 400);
        }

        $request->user()->update(['password' => Hash::make($request->password)]);
        return response()->json(['message' => 'Password changed successfully']);
    }

    // ─── Email verification ───────────────────────────────────────────────────

    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => 'Email already verified'], 200);
        }

        $user->sendEmailVerificationNotification();
        return response()->json(['message' => 'Verification email sent']);
    }

    // ─── Phone verification ───────────────────────────────────────────────────

    public function verifyPhone(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->phone) {
            return response()->json(['message' => 'Please add a phone number first in Contact Info'], 422);
        }

        $user->update(['phone_verified' => true]);

        return response()->json([
            'message' => 'Phone number verified successfully',
            'user'    => $this->formatUser($user->fresh()),
        ]);
    }

    // ─── Google OAuth ─────────────────────────────────────────────────────────

    public function googleRedirect()
    {
        return Socialite::driver('google')
            ->stateless()
            ->redirect();
    }

    public function googleCallback()
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect("{$frontendUrl}/auth/callback?error=google_auth_failed");
        }

        // Find or create user by google_id or email
        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        if ($user) {
            $updates = [];
            if (!$user->google_id) {
                $updates['google_id'] = $googleUser->getId();
            }
            // Always sync Google avatar (unless the user has a locally uploaded file)
            $hasLocalAvatar = $user->avatar && !str_starts_with($user->avatar, 'http');
            if (!$hasLocalAvatar) {
                $updates['avatar'] = $this->highResGoogleAvatar($googleUser->getAvatar());
            }
            if (!empty($updates)) {
                $user->update($updates);
            }
        } else {
            // Create new user from Google data — forceFill for guarded fields
            $user = (new User)->forceFill([
                'name'              => $googleUser->getName(),
                'username'          => $this->generateUsername($googleUser->getName()),
                'email'             => $googleUser->getEmail(),
                'password'          => Hash::make(Str::random(32)),
                'role'              => 'freelancer', // default; user can change in onboarding
                'google_id'         => $googleUser->getId(),
                'avatar'            => $this->highResGoogleAvatar($googleUser->getAvatar()),
                'email_verified_at' => now(), // Google already verified the email
                'is_active'         => true,
            ]);

            $user->save();
            $user->freelancerProfile()->create([]);
            Wallet::create(['user_id' => $user->id]);
            Subscription::create(['user_id' => $user->id, 'plan' => 'free', 'connects_balance' => 10]);
        }

        // Reject Google login for banned accounts
        if (!$user->is_active) {
            return redirect("{$frontendUrl}/auth/callback?error=account_suspended");
        }

        $user->update(['is_online' => true, 'last_seen_at' => now()]);
        $token = $user->createToken('auth_token')->plainTextToken;

        NotificationController::seedForUser($user->id, get_class($user), $user->role);

        $userEncoded = urlencode(json_encode($this->formatUser($user)));

        return redirect("{$frontendUrl}/auth/callback?token={$token}&user={$userEncoded}");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /**
     * Save a base64 data-URI avatar. Hardened against:
     *  - Wrong MIME type (only image/jpeg, image/png, image/webp accepted)
     *  - Mismatch between declared MIME and actual bytes (re-verified via getimagesizefromstring)
     *  - Oversized uploads (max ~5 MB decoded)
     *  - Fake extensions (server picks the extension from the verified MIME)
     */
    private function saveBase64Avatar(string $base64): ?string
    {
        try {
            // Must be a data URI: data:image/png;base64,iVBOR...
            if (!preg_match('#^data:(image/(jpeg|png|webp));base64,(.+)$#', $base64, $m)) {
                return null;
            }
            $declaredMime = $m[1];
            $payload      = $m[3];

            $decoded = base64_decode($payload, true);
            if ($decoded === false) return null;

            // Hard size limit: ~5 MB decoded
            if (strlen($decoded) > 5 * 1024 * 1024) return null;

            // Verify the bytes are actually an image and the MIME matches what was declared
            $info = @getimagesizefromstring($decoded);
            if ($info === false) return null;

            $allowed = [
                IMAGETYPE_JPEG => ['mime' => 'image/jpeg', 'ext' => 'jpg'],
                IMAGETYPE_PNG  => ['mime' => 'image/png',  'ext' => 'png'],
                IMAGETYPE_WEBP => ['mime' => 'image/webp', 'ext' => 'webp'],
            ];
            if (!isset($allowed[$info[2]]) || $allowed[$info[2]]['mime'] !== $declaredMime) {
                return null;
            }

            // Cap dimensions to prevent decompression-bomb resource exhaustion
            if ($info[0] > 4096 || $info[1] > 4096) return null;

            $filename = 'avatars/' . Str::uuid() . '.' . $allowed[$info[2]]['ext'];
            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $decoded);
            return $filename;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function highResGoogleAvatar(?string $url): ?string
    {
        if (!$url) return null;

        // Strip ?sz= / &sz= query suffixes (Google's CDN ignores them anyway).
        $url = preg_replace('/[?&]sz=\d+/', '', $url);

        // If URL already has =sN-c (or =sN), normalize it to =s200-c.
        if (preg_match('/=s\d+(-c)?$/', $url)) {
            $url = preg_replace('/=s\d+(-c)?$/', '=s200-c', $url);
        } else {
            // Otherwise append the path-style size suffix Google actually respects.
            $url .= '=s200-c';
        }

        return $url;
    }

    private function generateUsername(string $name): string
    {
        $base     = Str::slug($name, '_');
        $username = $base;
        $i        = 1;
        while (User::where('username', $username)->exists()) {
            $username = $base . '_' . $i++;
        }
        return $username;
    }

    private function formatUser(User $user): array
    {
        $data = [
            'id'               => $user->id,
            'name'             => $user->name,
            'username'         => $user->username,
            'email'            => $user->email,
            'role'             => $user->role,
            'avatar_url'       => $user->avatar_url,
            'country'          => $user->country,
            'timezone'         => $user->timezone,
            'phone'            => $user->phone,
            'is_verified'      => $user->is_verified,
            'is_online'        => $user->is_online,
            'email_verified'   => !is_null($user->email_verified_at),
            'phone_verified'   => (bool) $user->phone_verified,
            'connects_balance' => (int) $user->connects_balance,
            'google_connected' => !is_null($user->google_id),
            'created_at'       => $user->created_at,
            'onboarding_completed' => (bool) optional($user->freelancerProfile)->onboarding_completed,
        ];

        if ($user->relationLoaded('freelancerProfile') && $user->freelancerProfile) {
            $data['freelancer_profile'] = $user->freelancerProfile;
        }
        if ($user->relationLoaded('clientProfile') && $user->clientProfile) {
            $data['client_profile'] = $user->clientProfile;
        }
        if ($user->relationLoaded('subscription') && $user->subscription) {
            $data['subscription'] = $user->subscription;
        }
        if ($user->relationLoaded('wallet') && $user->wallet) {
            $data['wallet'] = [
                'balance'         => $user->wallet->balance,
                'pending_balance' => $user->wallet->pending_balance,
                'escrow_balance'  => $user->wallet->escrow_balance,
                'currency'        => $user->wallet->currency,
            ];
        }
        return $data;
    }
}
