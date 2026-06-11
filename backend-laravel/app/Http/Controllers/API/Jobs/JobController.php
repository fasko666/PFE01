<?php

namespace App\Http\Controllers\API\Jobs;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = JobPosting::with(['client', 'category'])
            ->where('status', 'open')
            ->where('visibility', 'public');

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereRaw('LOWER(skills) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }
        if ($request->category_id)  $query->where('category_id', $request->category_id);
        if ($request->job_type)     $query->where('type', $request->job_type);
        if ($request->experience_level) $query->where('experience_level', $request->experience_level);
        if ($request->budget_min)   $query->where('budget_min', '>=', $request->budget_min);
        if ($request->budget_max)   $query->where('budget_max', '<=', $request->budget_max);

        $sortMap = ['newest' => 'created_at', 'created_at' => 'created_at', 'budget_max' => 'budget_max', 'proposals_count' => 'proposals_count'];
        $sortBy  = $sortMap[$request->sort ?? 'newest'] ?? 'created_at';
        $query->orderBy('is_featured', 'desc')
              ->orderBy($sortBy, $sortBy === 'proposals_count' ? 'asc' : 'desc');

        $jobs = $query->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => [
                'data' => $jobs->items(),
                'meta' => [
                    'total'        => $jobs->total(),
                    'per_page'     => $jobs->perPage(),
                    'current_page' => $jobs->currentPage(),
                    'last_page'    => $jobs->lastPage(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Accept both alias and real field names
        $input = array_merge($request->all(), [
            'type'   => $request->job_type ?? $request->type ?? 'fixed',
            'skills' => $request->skills_required ?? $request->skills ?? [],
        ]);

        $validator = Validator::make($input, [
            'title'            => 'required|string|max:255',
            'description'      => 'required|string|min:50',
            'category_id'      => 'nullable|exists:categories,id',
            'skills'           => 'nullable|array',
            'type'             => 'required|in:hourly,fixed',
            'experience_level' => 'required|in:entry,intermediate,expert',
            'budget_min'       => 'nullable|numeric|min:0',
            'budget_max'       => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $job = JobPosting::create([
            'client_id'           => $user->id,
            'title'               => $input['title'],
            'description'         => $input['description'],
            'category_id'         => $input['category_id'] ?? null,
            'skills'              => $input['skills'],
            'type'                => $input['type'],
            'experience_level'    => $input['experience_level'],
            'budget_min'          => $input['budget_min'] ?? null,
            'budget_max'          => $input['budget_max'] ?? null,
            'duration'            => $request->project_duration ?? $request->duration ?? null,
            'location_requirement'=> $request->location ?? $request->location_requirement ?? null,
            'status'              => 'open',
            'visibility'          => $request->visibility ?? 'public',
        ]);

        return response()->json(['data' => $job->load('client', 'category')], 201);
    }

    public function show(JobPosting $job): JsonResponse
    {
        $job->increment('views_count');
        $job->load(['client.clientProfile', 'category']);
        return response()->json(['data' => $job]);
    }

    public function update(Request $request, JobPosting $job): JsonResponse
    {
        if ($job->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->update(array_filter([
            'title'            => $request->title,
            'description'      => $request->description,
            'category_id'      => $request->category_id,
            'skills'           => $request->skills_required ?? $request->skills,
            'type'             => $request->job_type ?? $request->type,
            'experience_level' => $request->experience_level,
            'budget_min'       => $request->budget_min,
            'budget_max'       => $request->budget_max,
            'status'           => $request->status,
        ], fn($v) => !is_null($v)));

        return response()->json(['data' => $job->fresh()]);
    }

    public function destroy(Request $request, JobPosting $job): JsonResponse
    {
        if ($job->client_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $job->delete();
        return response()->json(['data' => ['message' => 'Job deleted']]);
    }

    public function myJobs(Request $request): JsonResponse
    {
        $jobs = JobPosting::with(['category'])
            ->where('client_id', $request->user()->id)
            ->withCount('proposals')
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        return response()->json([
            'data' => [
                'data' => $jobs->items(),
                'meta' => [
                    'total'        => $jobs->total(),
                    'per_page'     => $jobs->perPage(),
                    'current_page' => $jobs->currentPage(),
                    'last_page'    => $jobs->lastPage(),
                ],
            ],
        ]);
    }

    public function mySavedJobs(Request $request): JsonResponse
    {
        $jobs = $request->user()
            ->savedJobs()
            ->with(['client', 'category'])
            ->orderBy('saved_jobs.created_at', 'desc')
            ->paginate($request->per_page ?? 12);

        return response()->json([
            'data' => [
                'data' => $jobs->items(),
                'meta' => [
                    'total'        => $jobs->total(),
                    'per_page'     => $jobs->perPage(),
                    'current_page' => $jobs->currentPage(),
                    'last_page'    => $jobs->lastPage(),
                ],
            ],
        ]);
    }

    public function save(Request $request, JobPosting $job): JsonResponse
    {
        $user = $request->user();
        if ($user->savedJobs()->where('saved_jobs.job_id', $job->id)->exists()) {
            $user->savedJobs()->detach($job->id);
            return response()->json(['data' => ['saved' => false]]);
        }
        $user->savedJobs()->attach($job->id);
        return response()->json(['data' => ['saved' => true]]);
    }

    public function categories(): JsonResponse
    {
        $categories = Category::where('is_active', true)
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get(['id', 'name', 'slug', 'icon']);

        return response()->json(['data' => $categories]);
    }
}
