<?php

namespace App\Http\Controllers\API\Search;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\JobPosting;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Global multi-entity search. Uses MySQL FULLTEXT when available, falls back
 * to LIKE %q% for MySQL (tests) and as a safety net.
 *
 * Endpoints:
 *   GET /api/search?q=react&type=all|jobs|freelancers|contracts|messages
 *   GET /api/search/suggest?q=re  (autocomplete — cached 60s)
 */
class SearchController extends Controller
{
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q'    => 'required|string|min:2|max:120',
            'type' => 'nullable|in:all,jobs,freelancers,contracts,messages',
            // shared filters
            'category_id'      => 'nullable|integer',
            'budget_min'       => 'nullable|numeric|min:0',
            'budget_max'       => 'nullable|numeric|min:0',
            'min_rate'         => 'nullable|numeric|min:0',
            'max_rate'         => 'nullable|numeric|min:0',
            'country'          => 'nullable|string|max:80',
            'min_rating'       => 'nullable|numeric|min:0|max:5',
            'experience_level' => 'nullable|in:entry,intermediate,expert',
        ]);

        $q     = trim((string) $request->q);
        $type  = $request->input('type', 'all');
        $user  = $request->user();
        $fts   = DB::connection()->getDriverName() === 'mysql';

        $out = [];

        if ($type === 'all' || $type === 'jobs') {
            $out['jobs'] = $this->jobs($q, $request, $fts);
        }
        if ($type === 'all' || $type === 'freelancers') {
            $out['freelancers'] = $this->freelancers($q, $request, $fts);
        }
        if ($type === 'all' || $type === 'contracts') {
            $out['contracts'] = $user ? $this->contracts($q, $user->id, $fts) : [];
        }
        if ($type === 'all' || $type === 'messages') {
            $out['messages'] = $user ? $this->messages($q, $user->id, $fts) : [];
        }

        return response()->json(['data' => $out]);
    }

    /** Cheap autocomplete — cached, returns up to 8 job titles + 8 freelancer names. */
    public function suggest(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:1|max:60']);
        $q   = trim((string) $request->q);
        $key = 'search:suggest:'.md5(strtolower($q));

        $data = Cache::remember($key, 60, function () use ($q) {
            $needle = '%' . addcslashes($q, '%_\\') . '%';
            return [
                'jobs' => JobPosting::query()
                    ->where('status', 'open')->where('visibility', 'public')
                    ->where('title', 'like', $needle)
                    ->limit(8)->get(['id', 'title']),
                'freelancers' => User::query()
                    ->where('role', 'freelancer')->where('is_active', true)
                    ->where(function ($w) use ($needle) {
                        $w->where('name', 'like', $needle)->orWhere('username', 'like', $needle);
                    })
                    ->limit(8)->get(['id', 'name', 'username', 'avatar']),
            ];
        });

        return response()->json(['data' => $data]);
    }

    /* ── helpers ────────────────────────────────────────────────────────── */

    private function jobs(string $q, Request $req, bool $fts)
    {
        $query = JobPosting::query()
            ->select('id', 'title', 'description', 'budget_min', 'budget_max', 'type', 'experience_level', 'category_id', 'created_at')
            ->where('status', 'open')->where('visibility', 'public');

        $this->applyText($query, $q, $fts, ['title', 'description'], 'job_postings_search_idx');

        if ($req->filled('category_id'))      $query->where('category_id', (int) $req->category_id);
        if ($req->filled('budget_min'))       $query->where('budget_max', '>=', (float) $req->budget_min);
        if ($req->filled('budget_max'))       $query->where('budget_min', '<=', (float) $req->budget_max);
        if ($req->filled('experience_level')) $query->where('experience_level', $req->experience_level);

        return $query->limit(20)->get();
    }

    private function freelancers(string $q, Request $req, bool $fts)
    {
        $query = User::query()
            ->select('users.id', 'users.name', 'users.username', 'users.avatar', 'users.country')
            ->where('users.role', 'freelancer')->where('users.is_active', true)
            ->with(['freelancerProfile:user_id,title,hourly_rate,avg_rating,total_reviews,is_top_rated']);

        if ($fts) {
            $query->whereRaw('MATCH(name, username) AGAINST(? IN NATURAL LANGUAGE MODE)', [$q])
                ->orWhereHas('freelancerProfile', function ($w) use ($q) {
                    $w->whereRaw('MATCH(title, bio) AGAINST(? IN NATURAL LANGUAGE MODE)', [$q]);
                });
        } else {
            $needle = '%' . addcslashes($q, '%_\\') . '%';
            $query->where(function ($w) use ($needle) {
                $w->where('name', 'like', $needle)->orWhere('username', 'like', $needle);
            });
        }

        if ($req->filled('country'))          $query->where('country', $req->country);
        if ($req->filled('experience_level')) $query->whereHas('freelancerProfile', fn ($w) => $w->where('experience_level', $req->experience_level));
        if ($req->filled('min_rate'))         $query->whereHas('freelancerProfile', fn ($w) => $w->where('hourly_rate', '>=', (float) $req->min_rate));
        if ($req->filled('max_rate'))         $query->whereHas('freelancerProfile', fn ($w) => $w->where('hourly_rate', '<=', (float) $req->max_rate));
        if ($req->filled('min_rating'))       $query->whereHas('freelancerProfile', fn ($w) => $w->where('avg_rating', '>=', (float) $req->min_rating));

        return $query->limit(20)->get();
    }

    private function contracts(string $q, int $userId, bool $fts)
    {
        $query = Contract::query()
            ->select('id', 'title', 'description', 'status', 'amount', 'client_id', 'freelancer_id', 'created_at')
            ->where(function ($w) use ($userId) {
                $w->where('client_id', $userId)->orWhere('freelancer_id', $userId);
            });
        $this->applyText($query, $q, $fts, ['title', 'description'], 'contracts_search_idx');
        return $query->limit(20)->get();
    }

    private function messages(string $q, int $userId, bool $fts)
    {
        // Only return messages from conversations this user belongs to.
        $convIds = DB::table('conversation_participants')->where('user_id', $userId)->pluck('conversation_id');
        $query = Message::query()
            ->select('id', 'conversation_id', 'sender_id', 'body', 'created_at')
            ->whereIn('conversation_id', $convIds);
        $this->applyText($query, $q, $fts, ['body'], 'messages_search_idx');
        return $query->orderByDesc('created_at')->limit(20)->get();
    }

    private function applyText($query, string $q, bool $fts, array $columns, string $indexName): void
    {
        if ($fts) {
            $cols = implode(', ', $columns);
            $query->whereRaw("MATCH({$cols}) AGAINST(? IN NATURAL LANGUAGE MODE)", [$q]);
        } else {
            $needle = '%' . addcslashes($q, '%_\\') . '%';
            $query->where(function ($w) use ($columns, $needle) {
                foreach ($columns as $i => $col) {
                    $i === 0 ? $w->where($col, 'like', $needle) : $w->orWhere($col, 'like', $needle);
                }
            });
        }
    }
}
