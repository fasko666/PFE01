<?php

namespace App\Http\Controllers\API\Catalog;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCatalogProjectRequest;
use App\Models\CatalogProject;
use App\Models\SavedCatalogProject;
use App\Services\AuditLogService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogProjectController extends Controller
{
    public function __construct(private AuditLogService $audit) {}

    /** GET /api/catalog — list published projects */
    public function index(Request $request): JsonResponse
    {
        $q = CatalogProject::query()
            ->with('seller:id,name,username,avatar')
            ->where('status', 'published');
        if ($request->filled('q')) {
            $needle = '%' . addcslashes($request->q, '%_\\') . '%';
            $q->where(function ($w) use ($needle) {
                $w->where('title', 'like', $needle)->orWhere('description', 'like', $needle);
            });
        }
        if ($request->filled('category_id')) $q->where('category_id', $request->integer('category_id'));
        return response()->json(['data' => $q->orderByDesc('orders_count')->paginate($request->integer('per_page', 12))]);
    }

    /** GET /api/catalog/{catalogProject:slug} */
    public function show(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        if (! $request->user()?->can('view', $catalogProject) && $catalogProject->status !== 'published') {
            throw new AuthorizationException();
        }
        if ($catalogProject->status === 'published') $catalogProject->increment('views_count');
        $catalogProject->load(['seller:id,name,username,avatar,country', 'images', 'category:id,name,slug']);
        return response()->json(['data' => $catalogProject]);
    }

    /** POST /api/catalog */
    public function store(StoreCatalogProjectRequest $request): JsonResponse
    {
        if (! $request->user()->can('create', CatalogProject::class)) throw new AuthorizationException();
        $project = CatalogProject::create(array_merge($request->validated(), [
            'seller_id' => $request->user()->id,
            'status'    => 'pending_review',
        ]));
        $this->audit->log('catalog.created', $request->user()->id, $project);
        return response()->json(['data' => $project], 201);
    }

    public function update(StoreCatalogProjectRequest $request, CatalogProject $catalogProject): JsonResponse
    {
        if (! $request->user()->can('update', $catalogProject)) throw new AuthorizationException();
        $catalogProject->update($request->validated());
        return response()->json(['data' => $catalogProject->fresh()]);
    }

    public function destroy(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        if (! $request->user()->can('delete', $catalogProject)) throw new AuthorizationException();
        $catalogProject->delete();
        return response()->json(['data' => ['deleted' => true]]);
    }

    /* ── Save / unsave ───────────────────────────────────────────────── */

    public function save(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        SavedCatalogProject::firstOrCreate([
            'user_id' => $request->user()->id, 'catalog_project_id' => $catalogProject->id,
        ]);
        return response()->json(['data' => ['saved' => true]]);
    }

    public function unsave(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        SavedCatalogProject::where('user_id', $request->user()->id)
            ->where('catalog_project_id', $catalogProject->id)->delete();
        return response()->json(['data' => ['saved' => false]]);
    }

    public function saved(Request $request): JsonResponse
    {
        $rows = SavedCatalogProject::with('project.seller:id,name,username,avatar')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')->paginate(20);
        return response()->json(['data' => $rows]);
    }

    /* ── Admin moderation ────────────────────────────────────────────── */

    public function approve(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        if (! $request->user()->can('moderate', $catalogProject)) throw new AuthorizationException();
        $catalogProject->update([
            'status' => 'published', 'moderated_by' => $request->user()->id,
            'moderated_at' => now(), 'rejection_reason' => null,
        ]);
        $this->audit->log('catalog.approved', $request->user()->id, $catalogProject);
        return response()->json(['data' => $catalogProject->fresh()]);
    }

    public function reject(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        if (! $request->user()->can('moderate', $catalogProject)) throw new AuthorizationException();
        $request->validate(['rejection_reason' => 'required|string|min:5|max:2000']);
        $catalogProject->update([
            'status' => 'rejected', 'moderated_by' => $request->user()->id,
            'moderated_at' => now(), 'rejection_reason' => $request->input('rejection_reason'),
        ]);
        $this->audit->log('catalog.rejected', $request->user()->id, $catalogProject);
        return response()->json(['data' => $catalogProject->fresh()]);
    }
}
