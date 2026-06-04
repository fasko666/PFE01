<?php

namespace App\Http\Controllers\API\Agency;

use App\Http\Controllers\Controller;
use App\Http\Requests\InviteAgencyMemberRequest;
use App\Http\Requests\StoreAgencyRequest;
use App\Models\Agency;
use App\Models\AgencyInvitation;
use App\Models\AgencyMember;
use App\Models\User;
use App\Notifications\AgencyInvitationNotification;
use App\Services\AuditLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AgencyController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    /** GET /api/agencies — agencies the current user belongs to */
    public function index(Request $request): JsonResponse
    {
        $agencies = Agency::query()
            ->whereHas('members', fn ($q) => $q->where('user_id', $request->user()->id))
            ->withCount('members')
            ->get();
        return response()->json(['data' => $agencies]);
    }

    /** GET /api/agencies/{agency} — public agency profile */
    public function show(Request $request, Agency $agency): JsonResponse
    {
        $agency->load(['owner:id,name,username,avatar', 'memberUsers:id,name,username,avatar']);
        return response()->json(['data' => $agency]);
    }

    /** POST /api/agencies — creates the agency + owner row in agency_members */
    public function store(StoreAgencyRequest $request): JsonResponse
    {
        if (! $request->user()->can('create', Agency::class)) throw new AuthorizationException();

        $agency = DB::transaction(function () use ($request) {
            $a = Agency::create(array_merge($request->validated(), [
                'owner_id' => $request->user()->id,
            ]));
            AgencyMember::create([
                'agency_id' => $a->id,
                'user_id'   => $request->user()->id,
                'role'      => 'owner',
            ]);
            return $a;
        });

        $this->audit->log('agency.created', $request->user()->id, $agency, ['name' => $agency->name]);

        return response()->json(['data' => $agency->fresh('memberUsers')], 201);
    }

    public function update(StoreAgencyRequest $request, Agency $agency): JsonResponse
    {
        if (! $request->user()->can('update', $agency)) throw new AuthorizationException();
        $agency->update($request->validated());
        $this->audit->log('agency.updated', $request->user()->id, $agency);
        return response()->json(['data' => $agency->fresh()]);
    }

    public function destroy(Request $request, Agency $agency): JsonResponse
    {
        if (! $request->user()->can('delete', $agency)) throw new AuthorizationException();
        $agency->delete();
        $this->audit->log('agency.deleted', $request->user()->id, $agency);
        return response()->json(['data' => ['deleted' => true]]);
    }

    /* ── Members ────────────────────────────────────────────────────── */

    public function members(Request $request, Agency $agency): JsonResponse
    {
        if (! $request->user()->can('view', $agency)) throw new AuthorizationException();
        $members = $agency->members()->with('user:id,name,username,avatar,country')->get();
        return response()->json(['data' => $members]);
    }

    /** POST /api/agencies/{agency}/invitations */
    public function invite(InviteAgencyMemberRequest $request, Agency $agency): JsonResponse
    {
        if (! $request->user()->can('manageMembers', $agency)) throw new AuthorizationException();

        $existing = AgencyInvitation::where('agency_id', $agency->id)
            ->where('email', $request->email)
            ->where('status', 'pending')->first();
        if ($existing) {
            return response()->json(['message' => 'An invitation is already pending for this email.', 'data' => $existing], 409);
        }

        $invitation = AgencyInvitation::create([
            'agency_id'  => $agency->id,
            'invited_by' => $request->user()->id,
            'email'      => $request->email,
            'role'       => $request->role,
            'token'      => Str::random(48),
            'status'     => 'pending',
            'expires_at' => now()->addDays(14),
        ]);

        // If the invitee already has an account, notify them
        $invitee = User::where('email', $request->email)->first();
        if ($invitee) {
            try { $invitee->notify(new AgencyInvitationNotification($invitation)); }
            catch (\Throwable $e) { \Log::warning('Agency invite notify failed', ['err' => $e->getMessage()]); }
        }

        $this->audit->log('agency.member_invited', $request->user()->id, $agency, ['email' => $request->email, 'role' => $request->role]);

        return response()->json(['data' => $invitation], 201);
    }

    /** POST /api/agencies/invitations/{token}/accept (any authed user) */
    public function acceptInvitation(Request $request, string $token): JsonResponse
    {
        $invitation = AgencyInvitation::where('token', $token)->first();
        if (! $invitation) return response()->json(['message' => 'Invitation not found.'], 404);
        if (! $invitation->isOpen()) return response()->json(['message' => 'Invitation is no longer open.'], 422);
        if (strcasecmp($invitation->email, $request->user()->email) !== 0) {
            return response()->json(['message' => 'This invitation was sent to a different email.'], 403);
        }

        DB::transaction(function () use ($invitation, $request) {
            AgencyMember::firstOrCreate(
                ['agency_id' => $invitation->agency_id, 'user_id' => $request->user()->id],
                ['role' => $invitation->role]
            );
            $invitation->update(['status' => 'accepted', 'responded_at' => now()]);
        });

        $this->audit->log('agency.invitation_accepted', $request->user()->id, $invitation);

        return response()->json(['data' => ['accepted' => true, 'agency_id' => $invitation->agency_id]]);
    }

    /** POST /api/agencies/invitations/{token}/decline */
    public function declineInvitation(Request $request, string $token): JsonResponse
    {
        $invitation = AgencyInvitation::where('token', $token)->first();
        if (! $invitation) return response()->json(['message' => 'Invitation not found.'], 404);
        if (! $invitation->isOpen()) return response()->json(['message' => 'Invitation is no longer open.'], 422);

        $invitation->update(['status' => 'declined', 'responded_at' => now()]);
        return response()->json(['data' => ['declined' => true]]);
    }

    /** DELETE /api/agencies/{agency}/members/{member} */
    public function removeMember(Request $request, Agency $agency, User $member): JsonResponse
    {
        if (! $request->user()->can('manageMembers', $agency)) throw new AuthorizationException();
        if ((int) $member->id === (int) $agency->owner_id) {
            return response()->json(['message' => 'Cannot remove the owner. Transfer ownership first.'], 422);
        }

        AgencyMember::where('agency_id', $agency->id)->where('user_id', $member->id)->delete();
        $this->audit->log('agency.member_removed', $request->user()->id, $agency, ['user_id' => $member->id]);
        return response()->json(['data' => ['removed' => true]]);
    }

    /** POST /api/agencies/{agency}/transfer-ownership  body: { new_owner_id } */
    public function transferOwnership(Request $request, Agency $agency): JsonResponse
    {
        if (! $request->user()->can('transferOwnership', $agency)) throw new AuthorizationException();
        $request->validate(['new_owner_id' => 'required|integer|exists:users,id']);

        $newOwnerId = (int) $request->new_owner_id;
        $isMember = $agency->hasMember($newOwnerId);
        if (! $isMember) {
            return response()->json(['message' => 'New owner must already be an agency member.'], 422);
        }

        DB::transaction(function () use ($agency, $request, $newOwnerId) {
            // Demote current owner to admin, promote new user to owner
            AgencyMember::where('agency_id', $agency->id)->where('user_id', $request->user()->id)->update(['role' => 'admin']);
            AgencyMember::where('agency_id', $agency->id)->where('user_id', $newOwnerId)->update(['role' => 'owner']);
            $agency->update(['owner_id' => $newOwnerId]);
        });

        $this->audit->log('agency.ownership_transferred', $request->user()->id, $agency, ['new_owner_id' => $newOwnerId]);
        return response()->json(['data' => $agency->fresh()]);
    }
}
