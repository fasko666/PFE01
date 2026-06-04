<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditLogService;
use App\Services\TotpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;

/**
 * Two-factor authentication for SPA users.
 *
 * Flow:
 *   1. POST /two-factor/enable   → generate secret + recovery codes (NOT yet enabled)
 *                                  returns { secret, otpauth_uri, recovery_codes }
 *   2. POST /two-factor/confirm  → user submits a TOTP code; on success
 *                                  `two_factor_confirmed_at` is set
 *   3. POST /two-factor/disable  → require current password + TOTP code to disable
 *
 * Secrets and recovery codes are stored encrypted at rest (Laravel's app-key
 * envelope encryption via `Crypt`). They never leave the server in plaintext
 * except during the initial enable() response so the user can register the
 * code in their authenticator app.
 */
class TwoFactorController extends Controller
{
    public function __construct(
        private TotpService     $totp,
        private AuditLogService $audit,
    ) {}

    public function status(Request $request): JsonResponse
    {
        $u = $request->user();
        return response()->json([
            'data' => [
                'enabled'   => (bool) $u->two_factor_confirmed_at,
                'pending'   => $u->two_factor_secret && ! $u->two_factor_confirmed_at,
                'confirmed_at' => $u->two_factor_confirmed_at,
            ],
        ]);
    }

    public function enable(Request $request): JsonResponse
    {
        $u = $request->user();
        if ($u->two_factor_confirmed_at) {
            return response()->json(['message' => '2FA already enabled. Disable it first to regenerate.'], 422);
        }

        $secret  = $this->totp->generateSecret();
        $codes   = $this->totp->generateRecoveryCodes();
        $issuer  = (string) (config('app.name') ?: 'PANDA');

        $u->forceFill([
            'two_factor_secret'         => Crypt::encryptString($secret),
            'two_factor_recovery_codes' => Crypt::encryptString(json_encode($codes)),
            'two_factor_confirmed_at'   => null,
        ])->save();

        $this->audit->log('user.2fa.enable_requested', $u->id, $u);

        return response()->json([
            'data' => [
                'secret'         => $secret,
                'otpauth_uri'    => $this->totp->otpauthUri($secret, $u->email, $issuer),
                'recovery_codes' => $codes,
            ],
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|max:10']);
        $u = $request->user();
        if (! $u->two_factor_secret) {
            return response()->json(['message' => 'No pending 2FA setup. Call /two-factor/enable first.'], 422);
        }
        $secret = Crypt::decryptString($u->two_factor_secret);
        if (! $this->totp->verify($secret, $request->input('code'))) {
            return response()->json(['message' => 'Invalid code. Try again.'], 422);
        }
        $u->forceFill(['two_factor_confirmed_at' => now()])->save();

        $this->audit->log('user.2fa.confirmed', $u->id, $u);

        return response()->json(['data' => ['message' => 'Two-factor authentication enabled.']]);
    }

    public function disable(Request $request): JsonResponse
    {
        $u = $request->user();
        $request->validate([
            'password' => 'required|string',
            'code'     => 'required|string|max:20',  // either TOTP or a recovery code
        ]);

        if (! Hash::check($request->input('password'), $u->password)) {
            return response()->json(['message' => 'Password is incorrect.'], 422);
        }
        if (! $u->two_factor_confirmed_at || ! $u->two_factor_secret) {
            return response()->json(['message' => '2FA is not active on your account.'], 422);
        }

        $secret = Crypt::decryptString($u->two_factor_secret);
        $code   = $request->input('code');

        $ok = $this->totp->verify($secret, $code) || $this->consumeRecoveryCode($u, $code);
        if (! $ok) {
            return response()->json(['message' => 'Invalid TOTP or recovery code.'], 422);
        }

        $u->forceFill([
            'two_factor_secret'         => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at'   => null,
        ])->save();

        $this->audit->log('user.2fa.disabled', $u->id, $u);

        return response()->json(['data' => ['message' => '2FA disabled.']]);
    }

    /** Returns the otpauth URI alone (used to re-render the QR if user lost it). */
    public function qrCode(Request $request): JsonResponse
    {
        $u = $request->user();
        if (! $u->two_factor_secret) {
            return response()->json(['message' => 'Nothing to show — enable 2FA first.'], 404);
        }
        $secret = Crypt::decryptString($u->two_factor_secret);
        return response()->json([
            'data' => [
                'secret'      => $secret,
                'otpauth_uri' => $this->totp->otpauthUri($secret, $u->email, (string) config('app.name')),
            ],
        ]);
    }

    public function recoveryCodes(Request $request): JsonResponse
    {
        $u = $request->user();
        if (! $u->two_factor_recovery_codes) {
            return response()->json(['data' => []]);
        }
        $codes = json_decode(Crypt::decryptString($u->two_factor_recovery_codes), true) ?: [];
        return response()->json(['data' => $codes]);
    }

    public function regenerateRecoveryCodes(Request $request): JsonResponse
    {
        $u = $request->user();
        if (! $u->two_factor_confirmed_at) {
            return response()->json(['message' => '2FA must be enabled first.'], 422);
        }
        $codes = $this->totp->generateRecoveryCodes();
        $u->forceFill(['two_factor_recovery_codes' => Crypt::encryptString(json_encode($codes))])->save();
        $this->audit->log('user.2fa.recovery_codes_regenerated', $u->id, $u);
        return response()->json(['data' => $codes]);
    }

    /** Mark a recovery code as used (single-use) by removing it from the list. */
    private function consumeRecoveryCode(\App\Models\User $user, string $candidate): bool
    {
        if (! $user->two_factor_recovery_codes) return false;
        $codes = json_decode(Crypt::decryptString($user->two_factor_recovery_codes), true) ?: [];
        $idx = array_search(strtoupper(trim($candidate)), array_map('strtoupper', $codes), true);
        if ($idx === false) return false;
        unset($codes[$idx]);
        $user->forceFill(['two_factor_recovery_codes' => Crypt::encryptString(json_encode(array_values($codes)))])->save();
        return true;
    }
}
