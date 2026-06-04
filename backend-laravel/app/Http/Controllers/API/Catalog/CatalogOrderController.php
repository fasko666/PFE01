<?php

namespace App\Http\Controllers\API\Catalog;

use App\Http\Controllers\Controller;
use App\Models\CatalogOrder;
use App\Models\CatalogProject;
use App\Models\CatalogReview;
use App\Services\CatalogCheckoutService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class CatalogOrderController extends Controller
{
    public function __construct(private CatalogCheckoutService $checkout) {}

    /** POST /api/catalog/{catalogProject:slug}/orders/checkout */
    public function checkout(Request $request, CatalogProject $catalogProject): JsonResponse
    {
        $request->validate([
            'tier'         => 'required|in:basic,standard,premium',
            'requirements' => 'nullable|string|max:5000',
        ]);
        try {
            $result = $this->checkout->createCheckout(
                $request->user(), $catalogProject, $request->tier, $request->input('requirements'),
            );
        } catch (Throwable $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => [
            'order_id'     => $result['order']->id,
            'checkout_url' => $result['session']->url,
        ]]);
    }

    /** GET /api/catalog/orders/mine */
    public function mine(Request $request): JsonResponse
    {
        $u = $request->user();
        $role = $request->input('role', 'buyer');
        $q = CatalogOrder::with(['project:id,title,slug', 'buyer:id,name,avatar', 'seller:id,name,avatar']);
        $q->where($role === 'seller' ? 'seller_id' : 'buyer_id', $u->id);
        return response()->json(['data' => $q->orderByDesc('created_at')->paginate(20)]);
    }

    /** GET /api/catalog/orders/{catalogOrder} */
    public function show(Request $request, CatalogOrder $catalogOrder): JsonResponse
    {
        if (! $request->user()->can('view', $catalogOrder)) throw new AuthorizationException();
        $catalogOrder->load(['project:id,title,slug,seller_id', 'buyer:id,name,avatar', 'seller:id,name,avatar', 'contract:id,title,status', 'review']);
        return response()->json(['data' => $catalogOrder]);
    }

    /** POST /api/catalog/orders/{catalogOrder}/deliver — seller marks delivered */
    public function deliver(Request $request, CatalogOrder $catalogOrder): JsonResponse
    {
        if (! $request->user()->can('deliver', $catalogOrder)) throw new AuthorizationException();
        $catalogOrder->update(['status' => 'delivered', 'delivered_at' => now()]);
        return response()->json(['data' => $catalogOrder->fresh()]);
    }

    /** POST /api/catalog/orders/{catalogOrder}/complete — buyer accepts */
    public function complete(Request $request, CatalogOrder $catalogOrder): JsonResponse
    {
        if (! $request->user()->can('complete', $catalogOrder)) throw new AuthorizationException();
        $catalogOrder->update(['status' => 'completed', 'completed_at' => now()]);
        return response()->json(['data' => $catalogOrder->fresh()]);
    }

    /** POST /api/catalog/orders/{catalogOrder}/review */
    public function review(Request $request, CatalogOrder $catalogOrder): JsonResponse
    {
        if (! $request->user()->can('review', $catalogOrder)) throw new AuthorizationException();
        $request->validate([
            'rating'  => 'required|numeric|min:1|max:5',
            'comment' => 'nullable|string|max:2000',
        ]);

        $review = CatalogReview::firstOrCreate(
            ['catalog_order_id' => $catalogOrder->id],
            [
                'catalog_project_id' => $catalogOrder->catalog_project_id,
                'reviewer_id'        => $request->user()->id,
                'rating'             => round((float) $request->rating, 2),
                'comment'            => $request->comment,
            ]
        );

        // Recompute project avg
        $project = $catalogOrder->project;
        if ($project) {
            $avg = CatalogReview::where('catalog_project_id', $project->id)->avg('rating') ?? 0;
            $cnt = CatalogReview::where('catalog_project_id', $project->id)->count();
            $project->update(['avg_rating' => round((float) $avg, 2), 'reviews_count' => $cnt]);
        }

        return response()->json(['data' => $review], 201);
    }
}
