<?php

namespace App\Http\Controllers\API\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

/**
 * Forgot / reset password — wired against Laravel's built-in password broker.
 *
 *   POST /api/auth/forgot-password    body: { email }
 *   POST /api/auth/reset-password     body: { token, email, password, password_confirmation }
 *
 * Behavior:
 *   - For privacy we ALWAYS return 200 from forgot-password (no email enumeration).
 *   - Rate-limited by `throttle:5,1` in routes/api.php.
 *   - The reset link points at the frontend: ${FRONTEND_URL}/reset-password?token=…&email=…
 */
class PasswordResetController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email'),
            function (User $user, string $token) {
                $url = rtrim((string) env('FRONTEND_URL', 'http://localhost:5173'), '/')
                    . '/reset-password?token=' . urlencode($token)
                    . '&email=' . urlencode($user->email);
                // Use Laravel's built-in mail (channels list-only via notification = simpler here):
                $user->sendPasswordResetNotification($token);
                // Replace the default mail with our custom URL by attaching it transiently:
                // (Laravel's ResetPassword::$createUrlCallback is the SPA-friendly hook.)
                \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(fn () => $url);
            }
        );

        // Always 200 to avoid email enumeration. Status is logged.
        $this->audit->log('auth.password.forgot_requested', null, null, [
            'email' => $request->input('email'),
            'status' => $status,
        ]);

        return response()->json([
            'message' => 'If an account exists for this email, a reset link has been sent.',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password'       => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Invalidate all existing API tokens after a password change.
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            $this->audit->log('auth.password.reset', null, null, ['email' => $request->input('email')]);
            return response()->json(['message' => 'Password reset successfully. Please log in.']);
        }

        // INVALID_TOKEN, INVALID_USER, RESET_THROTTLED → return 422 with the translated reason.
        return response()->json([
            'message' => __($status),
            'errors'  => ['email' => [__($status)]],
        ], 422);
    }
}
