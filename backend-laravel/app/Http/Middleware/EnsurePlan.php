<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Feature-gating middleware.
 *
 * Usage:
 *   Route::middleware('plan:freelancer_plus')->group(...)
 *   Route::middleware('plan:business,team_workspace')->...   // requires plan OR feature flag
 *
 * Logic:
 *   - If a feature key is provided (2nd arg), passes when the user's plan has
 *     that feature flag = true (works for any tier that grants it).
 *   - Otherwise checks that the user is subscribed to $minPlan OR higher in
 *     config/plans.hierarchy.
 */
class EnsurePlan
{
    public function handle(Request $request, Closure $next, string $minPlan, ?string $feature = null): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        // Resolve the user's currently active plan (default 'free' if no active subscription)
        $sub  = $user->subscriptions()->where('type', 'default')->latest()->first();
        $slug = ($sub && $sub->active()) ? $sub->plan_slug : 'free';

        if ($feature) {
            $features = (array) config("plans.plans.{$slug}.features", []);
            if (! ($features[$feature] ?? false)) {
                return response()->json([
                    'message'         => "Your plan does not include the \"{$feature}\" feature.",
                    'required_plan'   => $minPlan,
                    'required_feature'=> $feature,
                    'current_plan'    => $slug,
                    'upgrade_url'     => '/pricing',
                ], 403);
            }
            return $next($request);
        }

        $hierarchy = (array) config('plans.hierarchy', []);
        $currentIdx = array_search($slug, $hierarchy, true);
        $requiredIdx = array_search($minPlan, $hierarchy, true);

        if ($currentIdx === false || $requiredIdx === false || $currentIdx < $requiredIdx) {
            return response()->json([
                'message'       => "This action requires the {$minPlan} plan or higher.",
                'required_plan' => $minPlan,
                'current_plan'  => $slug,
                'upgrade_url'   => '/pricing',
            ], 403);
        }

        return $next($request);
    }
}
