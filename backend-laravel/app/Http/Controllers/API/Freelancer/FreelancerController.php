<?php

namespace App\Http\Controllers\API\Freelancer;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Skill;
use App\Models\Portfolio;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class FreelancerController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['freelancerProfile', 'skills', 'subscription'])
            ->where('role', 'freelancer')
            ->where('is_active', true);

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhereHas('freelancerProfile', fn($q2) =>
                      $q2->where('title', 'like', "%{$request->search}%")
                         ->orWhere('bio', 'like', "%{$request->search}%")
                  );
            });
        }
        if ($request->skill) {
            $query->whereHas('skills', fn($q) => $q->where('name', 'like', "%{$request->skill}%"));
        }
        if ($request->min_rate) {
            $query->whereHas('freelancerProfile', fn($q) => $q->where('hourly_rate', '>=', $request->min_rate));
        }
        if ($request->max_rate) {
            $query->whereHas('freelancerProfile', fn($q) => $q->where('hourly_rate', '<=', $request->max_rate));
        }
        if ($request->experience_level) {
            $query->whereHas('freelancerProfile', fn($q) => $q->where('experience_level', $request->experience_level));
        }
        if ($request->country) {
            $query->where('country', $request->country);
        }
        if ($request->top_rated) {
            $query->whereHas('freelancerProfile', fn($q) => $q->where('is_top_rated', true));
        }

        $sort = $request->sort ?? 'rating';
        if ($sort === 'rate_asc') {
            $query->join('freelancer_profiles', 'users.id', '=', 'freelancer_profiles.user_id')
                  ->orderBy('freelancer_profiles.hourly_rate', 'asc')->select('users.*');
        } elseif ($sort === 'rate_desc') {
            $query->join('freelancer_profiles', 'users.id', '=', 'freelancer_profiles.user_id')
                  ->orderBy('freelancer_profiles.hourly_rate', 'desc')->select('users.*');
        } elseif ($sort === 'rating') {
            $query->join('freelancer_profiles', 'users.id', '=', 'freelancer_profiles.user_id')
                  ->orderBy('freelancer_profiles.avg_rating', 'desc')->select('users.*');
        } else {
            $query->orderBy('created_at', 'desc');
        }

        $freelancers = $query->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => [
                'data' => $freelancers->items(),
                'meta' => [
                    'total'        => $freelancers->total(),
                    'per_page'     => $freelancers->perPage(),
                    'current_page' => $freelancers->currentPage(),
                    'last_page'    => $freelancers->lastPage(),
                ],
            ],
        ]);
    }

    public function show(string $username): JsonResponse
    {
        $user = User::with(['freelancerProfile', 'skills', 'portfolios'])
            ->where('username', $username)
            ->where('role', 'freelancer')
            ->firstOrFail();

        // Load reviews with reviewer info
        $reviews = \App\Models\Review::with('reviewer:id,name,username')
            ->where('reviewee_id', $user->id)
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

        $data = $user->toArray();
        $data['reviews']       = $reviews;
        $data['reviews_count'] = $reviews->count();
        $data['avg_rating']    = $user->freelancerProfile?->avg_rating ?? 0;

        return response()->json(['data' => $data]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->fill(array_filter([
            'country' => $request->country,
            'phone'   => $request->phone,
        ], fn($v) => !is_null($v)))->save();

        $profileData = array_filter([
            'title'        => $request->title,
            'bio'          => $request->bio,
            'hourly_rate'  => $request->hourly_rate,
            'availability' => $request->availability,
        ], fn($v) => !is_null($v));

        if (!empty($profileData)) {
            $user->freelancerProfile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        return response()->json(['data' => $user->fresh(['freelancerProfile', 'skills'])]);
    }

    // ─── Onboarding ──────────────────────────────────────────────────────────
    public function onboarding(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'freelancer') {
            return response()->json(['message' => 'Only freelancers can complete onboarding'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title'        => 'nullable|string|max:255',
            'bio'          => 'nullable|string|max:5000',
            'hourly_rate'  => 'nullable|numeric|min:3|max:999',
            'category'     => 'nullable|string|max:120',
            'specialties'  => 'nullable|array',
            'skills'       => 'nullable|array',
            'languages'    => 'nullable|array',
            'experience'   => 'nullable|array',
            'education'    => 'nullable|array',
            'country'      => 'nullable|string|max:120',
            'phone'        => 'nullable|string|max:40',
            'date_of_birth'=> 'nullable|date',
            'address'      => 'nullable|array',
            'avatar'       => 'nullable|string', // base64 data URL or http(s) URL
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        // ─── 1. Avatar (base64 → stored file, or external URL kept as-is) ───
        if (!empty($data['avatar'])) {
            if (str_starts_with($data['avatar'], 'data:')) {
                $saved = $this->saveBase64Avatar($data['avatar']);
                if ($saved) $user->avatar = $saved;
            } elseif (str_starts_with($data['avatar'], 'http')) {
                $user->avatar = $data['avatar'];
            }
        }

        // ─── 2. User fields (country, phone) ───
        if (isset($data['country'])) $user->country = $data['country'];
        if (isset($data['phone']))   $user->phone   = $data['phone'];
        $user->save();

        // ─── 3. Freelancer profile fields ───
        $profileData = array_filter([
            'title'                => $data['title']        ?? null,
            'bio'                  => $data['bio']          ?? null,
            'hourly_rate'          => $data['hourly_rate']  ?? null,
            'category'             => $data['category']     ?? null,
            'specialties'          => isset($data['specialties']) ? $data['specialties'] : null,
            'languages'            => isset($data['languages'])   ? $data['languages']   : null,
            'experience'           => isset($data['experience'])  ? $data['experience']  : null,
            'education'            => isset($data['education'])   ? $data['education']   : null,
            'date_of_birth'        => $data['date_of_birth'] ?? null,
            'address'              => isset($data['address']) ? $data['address'] : null,
            'onboarding_completed' => true,
        ], fn($v) => !is_null($v));

        // Only set columns that actually exist (graceful if migration hasn't been run)
        $columns = \Schema::getColumnListing('freelancer_profiles');
        $profileData = array_intersect_key($profileData, array_flip($columns));

        $user->freelancerProfile()->updateOrCreate(['user_id' => $user->id], $profileData);

        // ─── 4. Skills ─── sync by name (creates new ones if missing)
        if (!empty($data['skills']) && is_array($data['skills'])) {
            $syncData = [];
            foreach ($data['skills'] as $name) {
                if (!is_string($name) || trim($name) === '') continue;
                $skill = Skill::firstOrCreate(
                    ['name' => trim($name)],
                    ['slug' => \Illuminate\Support\Str::slug($name), 'is_active' => true]
                );
                $syncData[$skill->id] = ['level' => 'intermediate'];
            }
            $user->skills()->syncWithoutDetaching($syncData);
        }

        $fresh = $user->fresh(['freelancerProfile', 'skills']);

        return response()->json([
            'message' => 'Onboarding complete',
            'data'    => $fresh,
        ]);
    }

    // ─── Helper — same shape as AuthController's, kept private here ──────────
    private function saveBase64Avatar(string $base64): ?string
    {
        try {
            if (!str_contains($base64, ',')) return null;
            $data    = explode(',', $base64, 2)[1];
            $decoded = base64_decode($data);
            if (!$decoded) return null;

            $filename = 'avatars/' . \Illuminate\Support\Str::uuid() . '.jpg';
            \Illuminate\Support\Facades\Storage::disk('public')->put($filename, $decoded);
            return $filename;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function addSkills(Request $request): JsonResponse
    {
        $user = $request->user();

        // Accept array of skill name strings
        $skillNames = $request->skills ?? [];
        if (empty($skillNames)) {
            return response()->json(['data' => $user->skills]);
        }

        $syncData = [];
        foreach ($skillNames as $name) {
            $skill = Skill::firstOrCreate(
                ['name' => $name],
                ['slug' => \Illuminate\Support\Str::slug($name), 'is_active' => true]
            );
            $syncData[$skill->id] = ['level' => 'intermediate'];
        }

        $user->skills()->syncWithoutDetaching($syncData);

        return response()->json(['data' => $user->fresh()->skills]);
    }

    public function storePortfolio(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'url'         => 'nullable|url',
            'image_url'   => 'nullable|url',
        ]);
        if ($validator->fails()) return response()->json(['errors' => $validator->errors()], 422);

        $portfolio = Portfolio::create([
            ...$validator->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json(['data' => $portfolio], 201);
    }

    public function destroyPortfolio(Request $request, Portfolio $portfolio): JsonResponse
    {
        if ($portfolio->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $portfolio->delete();
        return response()->json(['data' => ['message' => 'Portfolio deleted']]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user()->load('freelancerProfile', 'subscription', 'wallet');

        $proposalsCount  = $user->proposals()->count();
        $activeContracts = $user->freelancerContracts()->where('status', 'active')->count();
        $totalEarned     = $user->wallet?->balance ?? 0;
        $avgRating       = $user->freelancerProfile?->avg_rating ?? 0;
        $reviewsCount    = $user->freelancerProfile?->total_reviews ?? 0;
        $connects        = (int) $user->connects_balance;

        $recentProposals = $user->proposals()
            ->with('job')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'proposals_count'   => $proposalsCount,
                'active_contracts'  => $activeContracts,
                'total_earned'      => $totalEarned,
                'avg_rating'        => $avgRating,
                'reviews_count'     => $reviewsCount,
                'connects_remaining'=> $connects,
                'recent_proposals'  => $recentProposals,
            ],
        ]);
    }
}
