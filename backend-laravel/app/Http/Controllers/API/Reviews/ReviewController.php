<?php

namespace App\Http\Controllers\API\Reviews;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /** Public: list all reviews for a freelancer */
    public function forFreelancer(int $userId): JsonResponse
    {
        $reviews = Review::with('reviewer:id,name,username')
            ->where('reviewee_id', $userId)
            ->where('is_public', true)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'         => $r->id,
                'rating'     => (float) $r->rating,
                'comment'    => $r->comment,
                'breakdown'  => $r->breakdown,
                'created_at' => $r->created_at,
                'reviewer'   => [
                    'id'         => $r->reviewer?->id,
                    'name'       => $r->reviewer?->name,
                    'username'   => $r->reviewer?->username,
                    'avatar_url' => $r->reviewer?->avatar_url,
                ],
            ]);

        return response()->json(['data' => $reviews]);
    }

    /** Authenticated: submit a new review */
    public function store(Request $request): JsonResponse
    {
        $v = Validator::make($request->all(), [
            'reviewee_id' => 'required|integer|exists:users,id',
            'rating'      => 'required|numeric|min:1|max:5',
            'comment'     => 'nullable|string|max:1000',
            'breakdown'   => 'nullable|array',
            'breakdown.communication' => 'nullable|numeric|min:1|max:5',
            'breakdown.quality'       => 'nullable|numeric|min:1|max:5',
            'breakdown.timeliness'    => 'nullable|numeric|min:1|max:5',
        ]);

        if ($v->fails()) {
            return response()->json(['errors' => $v->errors()], 422);
        }

        $reviewer = $request->user();
        $revieweeId = (int) $request->reviewee_id;

        if ($reviewer->id === $revieweeId) {
            return response()->json(['message' => 'You cannot review yourself'], 422);
        }

        $already = Review::where('reviewer_id', $reviewer->id)
            ->where('reviewee_id', $revieweeId)
            ->exists();

        if ($already) {
            return response()->json(['message' => 'You have already reviewed this freelancer'], 422);
        }

        $review = Review::create([
            'contract_id' => null,
            'reviewer_id' => $reviewer->id,
            'reviewee_id' => $revieweeId,
            'rating'      => round((float) $request->rating, 2),
            'comment'     => $request->comment,
            'breakdown'   => $request->breakdown,
            'is_public'   => true,
        ]);

        // Recalculate avg_rating on freelancer profile
        $avg = Review::where('reviewee_id', $revieweeId)->avg('rating');
        $cnt = Review::where('reviewee_id', $revieweeId)->count();

        User::find($revieweeId)?->freelancerProfile?->update([
            'avg_rating'    => round((float) $avg, 2),
            'total_reviews' => $cnt,
        ]);

        return response()->json([
            'message' => 'Review submitted!',
            'data'    => array_merge($review->toArray(), [
                'reviewer' => [
                    'id'         => $reviewer->id,
                    'name'       => $reviewer->name,
                    'username'   => $reviewer->username,
                    'avatar_url' => $reviewer->avatar_url,
                ],
            ]),
        ], 201);
    }

    /** Reviewer can delete their own review */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        if ($review->reviewer_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $revieweeId = $review->reviewee_id;
        $review->delete();

        $avg = Review::where('reviewee_id', $revieweeId)->avg('rating') ?? 0;
        $cnt = Review::where('reviewee_id', $revieweeId)->count();

        User::find($revieweeId)?->freelancerProfile?->update([
            'avg_rating'    => round((float) $avg, 2),
            'total_reviews' => $cnt,
        ]);

        return response()->json(['message' => 'Review deleted']);
    }
}
