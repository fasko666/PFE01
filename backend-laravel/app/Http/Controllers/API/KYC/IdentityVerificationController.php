<?php

namespace App\Http\Controllers\API\KYC;

use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitIdentityVerificationRequest;
use App\Models\IdentityVerification;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IdentityVerificationController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    /** GET /api/verify-identity/status — current user's latest record */
    public function status(Request $request): JsonResponse
    {
        $row = IdentityVerification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')->first();

        return response()->json(['data' => $row ?: ['status' => 'not_submitted']]);
    }

    /** POST /api/verify-identity */
    public function store(SubmitIdentityVerificationRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        // Refuse if there's already an approved or pending submission
        $existing = IdentityVerification::where('user_id', $userId)
            ->whereIn('status', ['pending', 'in_review', 'approved'])->first();
        if ($existing) {
            return response()->json([
                'message' => $existing->status === 'approved'
                    ? 'Identity already verified.'
                    : 'A submission is already under review.',
                'data'    => $existing,
            ], 409);
        }

        $front  = $request->file('id_front')->store("kyc/{$userId}", 'local');
        $back   = $request->file('id_back')?->store("kyc/{$userId}", 'local');
        $selfie = $request->file('selfie')->store("kyc/{$userId}", 'local');

        $row = IdentityVerification::create([
            'user_id'         => $userId,
            'document_type'   => $request->input('document_type'),
            // For PII safety, only persist the last 4 of the document number.
            'document_number' => $request->filled('document_number')
                ? '****' . substr($request->input('document_number'), -4)
                : null,
            'country'         => strtoupper($request->input('country')),
            'id_front_path'   => $front,
            'id_back_path'    => $back,
            'selfie_path'     => $selfie,
            'status'          => 'pending',
            'submitted_at'    => now(),
        ]);

        $this->audit->log('kyc.submitted', $userId, $row, ['document_type' => $row->document_type]);

        return response()->json(['data' => $row], 201);
    }

    /* ─── Admin endpoints ───────────────────────────────────────────────── */

    /** GET /api/admin/kyc?status=pending */
    public function adminIndex(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'admin') throw new AuthorizationException();
        $request->validate(['status' => 'nullable|in:pending,in_review,approved,rejected']);

        $q = IdentityVerification::with('user:id,name,email,username,country,role');
        if ($request->filled('status')) $q->where('status', $request->status);

        return response()->json([
            'data' => $q->orderByDesc('created_at')->paginate($request->integer('per_page', 20)),
        ]);
    }

    /** GET /api/admin/kyc/{verification} — full record incl. signed file URLs */
    public function adminShow(Request $request, IdentityVerification $verification): JsonResponse
    {
        if ($request->user()->role !== 'admin') throw new AuthorizationException();
        $verification->load('user:id,name,email,username,country,role', 'reviewer:id,name,username');
        return response()->json([
            'data' => array_merge($verification->toArray(), [
                'urls' => [
                    'id_front' => $this->signed($verification->id_front_path),
                    'id_back'  => $this->signed($verification->id_back_path),
                    'selfie'   => $this->signed($verification->selfie_path),
                ],
            ]),
        ]);
    }

    /** POST /api/admin/kyc/{verification}/approve */
    public function approve(Request $request, IdentityVerification $verification): JsonResponse
    {
        if ($request->user()->role !== 'admin') throw new AuthorizationException();
        if (in_array($verification->status, ['approved', 'rejected'], true)) {
            return response()->json(['message' => "Already {$verification->status}"], 422);
        }

        $verification->update([
            'status'       => 'approved',
            'reviewed_by'  => $request->user()->id,
            'reviewed_at'  => now(),
        ]);

        // Mark the user as verified
        User::where('id', $verification->user_id)->update(['is_verified' => true]);

        $this->audit->log('kyc.approved', $request->user()->id, $verification);

        return response()->json(['data' => $verification->fresh()]);
    }

    /** POST /api/admin/kyc/{verification}/reject  body: { rejection_reason } */
    public function reject(Request $request, IdentityVerification $verification): JsonResponse
    {
        if ($request->user()->role !== 'admin') throw new AuthorizationException();
        $request->validate(['rejection_reason' => 'required|string|min:5|max:2000']);

        $verification->update([
            'status'           => 'rejected',
            'reviewed_by'      => $request->user()->id,
            'reviewed_at'      => now(),
            'rejection_reason' => $request->input('rejection_reason'),
        ]);

        $this->audit->log('kyc.rejected', $request->user()->id, $verification, [
            'reason' => $request->input('rejection_reason'),
        ]);

        return response()->json(['data' => $verification->fresh()]);
    }

    /** Build a temporary URL for the admin to view the document (10 min). */
    private function signed(?string $path): ?string
    {
        if (! $path) return null;
        $disk = \Illuminate\Support\Facades\Storage::disk('local');
        // For the local driver we can't generate a real signed URL; we expose
        // an admin-only download endpoint instead.
        return route('admin.kyc.file', ['path' => base64_encode($path)]);
    }
}
