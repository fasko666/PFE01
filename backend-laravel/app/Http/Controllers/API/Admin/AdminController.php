<?php

namespace App\Http\Controllers\API\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\JobPosting;
use App\Models\Contract;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_users'       => User::count(),
            'total_freelancers' => User::where('role', 'freelancer')->count(),
            'total_clients'     => User::where('role', 'client')->count(),
            'total_jobs'        => JobPosting::count(),
            'active_jobs'       => JobPosting::where('status', 'open')->count(),
            'total_contracts'   => Contract::count(),
            'active_contracts'  => Contract::where('status', 'active')->count(),
            'total_revenue'     => Transaction::where('type', 'fee')->sum('amount'),
            'new_users_today'        => User::whereDate('created_at', today())->count(),
            'new_users_this_month'   => User::where('created_at', '>=', now()->startOfMonth())->count(),
            'new_jobs_today'         => JobPosting::whereDate('created_at', today())->count(),
            'total_proposals'        => \App\Models\Proposal::count(),
            'total_reviews'          => \App\Models\Review::count(),
        ];

        $recentUsers = User::orderBy('created_at', 'desc')->limit(5)->get();
        $recentJobs  = JobPosting::with('client')->orderBy('created_at', 'desc')->limit(5)->get();

        return response()->json([
            'data' => array_merge($stats, [
                'recent_users' => $recentUsers,
                'recent_jobs'  => $recentJobs,
            ]),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::with(['freelancerProfile', 'clientProfile', 'subscription']);
        if ($request->role) $query->where('role', $request->role);
        if ($request->search) $query->where('name', 'like', "%{$request->search}%")->orWhere('email', 'like', "%{$request->search}%");
        $users = $query->orderBy('created_at', 'desc')->paginate(20);
        return response()->json(['data' => $users]);
    }

    public function banUser(Request $request, User $user): JsonResponse
    {
        // Prevent admin from banning themselves (lock-out protection)
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot ban yourself'], 422);
        }
        // Prevent banning other admins (privilege protection)
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Cannot ban another admin'], 403);
        }

        $user->forceFill(['is_active' => false])->save();
        $user->tokens()->delete();
        return response()->json(['message' => "User {$user->name} banned"]);
    }

    public function verifyUser(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot verify yourself'], 422);
        }
        $user->forceFill(['is_verified' => true])->save();
        return response()->json(['message' => "User {$user->name} verified"]);
    }

    public function analytics(Request $request): JsonResponse
    {
        $period = $request->period ?? 30;

        $userGrowth = User::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($period))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $jobsGrowth = JobPosting::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays($period))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $revenue = Transaction::selectRaw('DATE(created_at) as date, SUM(amount) as amount')
            ->where('type', 'fee')
            ->where('created_at', '>=', now()->subDays($period))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'user_growth' => $userGrowth,
            'jobs_growth' => $jobsGrowth,
            'revenue'     => $revenue,
        ]);
    }
}
