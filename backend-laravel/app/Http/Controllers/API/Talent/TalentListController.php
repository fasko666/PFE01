<?php

namespace App\Http\Controllers\API\Talent;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTalentListRequest;
use App\Models\TalentList;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TalentListController extends Controller
{
    /** GET /api/talent-lists */
    public function index(Request $request): JsonResponse
    {
        $rows = TalentList::where('user_id', $request->user()->id)
            ->withCount('freelancers')
            ->orderByDesc('updated_at')
            ->get();
        return response()->json(['data' => $rows]);
    }

    /** POST /api/talent-lists */
    public function store(StoreTalentListRequest $request): JsonResponse
    {
        if (! $request->user()->can('create', TalentList::class)) throw new AuthorizationException();

        $list = TalentList::create(array_merge($request->validated(), [
            'user_id' => $request->user()->id,
        ]));
        return response()->json(['data' => $list], 201);
    }

    /** GET /api/talent-lists/{talentList} */
    public function show(Request $request, TalentList $talentList): JsonResponse
    {
        if (! $request->user()->can('view', $talentList)) throw new AuthorizationException();
        $talentList->load(['freelancers' => function ($q) {
            $q->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.country')
                ->with(['freelancerProfile:user_id,title,hourly_rate,avg_rating,total_reviews']);
        }]);
        return response()->json(['data' => $talentList]);
    }

    /** PUT /api/talent-lists/{talentList} */
    public function update(StoreTalentListRequest $request, TalentList $talentList): JsonResponse
    {
        if (! $request->user()->can('update', $talentList)) throw new AuthorizationException();
        $talentList->update($request->validated());
        return response()->json(['data' => $talentList->fresh()]);
    }

    /** DELETE /api/talent-lists/{talentList} */
    public function destroy(Request $request, TalentList $talentList): JsonResponse
    {
        if (! $request->user()->can('delete', $talentList)) throw new AuthorizationException();
        $talentList->delete();
        return response()->json(['data' => ['deleted' => true]]);
    }

    /** POST /api/talent-lists/{talentList}/members  body: { freelancer_id, note? } */
    public function addMember(Request $request, TalentList $talentList): JsonResponse
    {
        if (! $request->user()->can('update', $talentList)) throw new AuthorizationException();
        $request->validate([
            'freelancer_id' => 'required|integer|exists:users,id',
            'note'          => 'nullable|string|max:500',
        ]);
        $talentList->freelancers()->syncWithoutDetaching([
            (int) $request->freelancer_id => ['note' => $request->input('note')],
        ]);
        return response()->json(['data' => ['added' => true]]);
    }

    /** DELETE /api/talent-lists/{talentList}/members/{freelancer} */
    public function removeMember(Request $request, TalentList $talentList, User $freelancer): JsonResponse
    {
        if (! $request->user()->can('update', $talentList)) throw new AuthorizationException();
        $talentList->freelancers()->detach($freelancer->id);
        return response()->json(['data' => ['removed' => true]]);
    }
}
