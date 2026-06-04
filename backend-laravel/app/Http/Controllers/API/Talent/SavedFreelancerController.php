<?php

namespace App\Http\Controllers\API\Talent;

use App\Http\Controllers\Controller;
use App\Models\SavedFreelancer;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedFreelancerController extends Controller
{
    /** GET /api/saved-freelancers */
    public function index(Request $request): JsonResponse
    {
        $rows = SavedFreelancer::with(['freelancer' => function ($q) {
            $q->select('id', 'name', 'username', 'avatar', 'country', 'role')
                ->with(['freelancerProfile:user_id,title,hourly_rate,avg_rating,total_reviews,is_top_rated']);
        }])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json(['data' => $rows]);
    }

    /** POST /api/saved-freelancers  body: { freelancer_id } */
    public function store(Request $request): JsonResponse
    {
        $request->validate(['freelancer_id' => 'required|integer|exists:users,id']);
        if ((int) $request->freelancer_id === (int) $request->user()->id) {
            return response()->json(['message' => 'You cannot save yourself.'], 422);
        }

        $row = SavedFreelancer::firstOrCreate([
            'user_id'       => $request->user()->id,
            'freelancer_id' => (int) $request->freelancer_id,
        ]);
        return response()->json(['data' => ['saved' => true, 'id' => $row->id]], 201);
    }

    /** DELETE /api/saved-freelancers/{freelancer} */
    public function destroy(Request $request, User $freelancer): JsonResponse
    {
        SavedFreelancer::where('user_id', $request->user()->id)
            ->where('freelancer_id', $freelancer->id)->delete();
        return response()->json(['data' => ['saved' => false]]);
    }

    /** GET /api/saved-freelancers/check/{freelancer} */
    public function check(Request $request, User $freelancer): JsonResponse
    {
        $saved = SavedFreelancer::where('user_id', $request->user()->id)
            ->where('freelancer_id', $freelancer->id)->exists();
        return response()->json(['data' => ['saved' => $saved]]);
    }
}
