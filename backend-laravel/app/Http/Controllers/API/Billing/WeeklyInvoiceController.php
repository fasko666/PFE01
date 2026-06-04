<?php

namespace App\Http\Controllers\API\Billing;

use App\Http\Controllers\Controller;
use App\Models\WeeklyInvoice;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WeeklyInvoiceController extends Controller
{
    /** GET /api/billing/invoices/weekly?role=freelancer|client */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $request->input('role', $user->role === 'client' ? 'client' : 'freelancer');

        $q = WeeklyInvoice::with(['contract:id,title', 'client:id,name,avatar', 'freelancer:id,name,avatar']);
        if ($role === 'client') $q->where('client_id', $user->id);
        else                    $q->where('freelancer_id', $user->id);

        return response()->json([
            'data' => $q->orderByDesc('week_start')->paginate($request->integer('per_page', 20)),
        ]);
    }

    /** GET /api/billing/invoices/weekly/{weeklyInvoice} */
    public function show(Request $request, WeeklyInvoice $weeklyInvoice): JsonResponse
    {
        if (! $request->user()->can('view', $weeklyInvoice)) {
            throw new AuthorizationException();
        }
        $weeklyInvoice->load(['contract:id,title,status', 'client:id,name,avatar', 'freelancer:id,name,avatar']);
        return response()->json(['data' => $weeklyInvoice]);
    }

    /** GET /api/billing/invoices/weekly/earnings — totals for the freelancer */
    public function earnings(Request $request): JsonResponse
    {
        $u = $request->user();
        $monthExpr = $this->monthExpression('week_end');
        $total = WeeklyInvoice::where('freelancer_id', $u->id)->where('status', 'paid')->sum('net_to_freelancer');
        $byMonth = WeeklyInvoice::where('freelancer_id', $u->id)->where('status', 'paid')
            ->selectRaw("$monthExpr as month, SUM(net_to_freelancer) as net, SUM(hours_worked) as hours")
            ->groupBy('month')->orderByDesc('month')->limit(12)->get();

        return response()->json(['data' => [
            'lifetime_net'   => (float) $total,
            'by_month'       => $byMonth,
            'last_processed' => WeeklyInvoice::where('freelancer_id', $u->id)->latest('processed_at')->value('processed_at'),
        ]]);
    }

    /** GET /api/billing/invoices/weekly/spending — totals for the client */
    public function spending(Request $request): JsonResponse
    {
        $u = $request->user();
        $monthExpr = $this->monthExpression('week_end');
        $total = WeeklyInvoice::where('client_id', $u->id)->where('status', 'paid')->sum('gross_amount');
        $byMonth = WeeklyInvoice::where('client_id', $u->id)->where('status', 'paid')
            ->selectRaw("$monthExpr as month, SUM(gross_amount) as gross")
            ->groupBy('month')->orderByDesc('month')->limit(12)->get();

        return response()->json(['data' => [
            'lifetime_gross' => (float) $total,
            'by_month'       => $byMonth,
        ]]);
    }

    /**
     * Portable 'YYYY-MM' extraction. SQLite/PostgreSQL/MySQL all expose a
     * substring-style call; we lean on substr(week_end, 1, 7) because every
     * supported driver renders a DATE column as 'YYYY-MM-DD' in text contexts.
     */
    private function monthExpression(string $column): string
    {
        return "substr({$column}, 1, 7)";
    }
}
