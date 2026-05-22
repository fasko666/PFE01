<?php

namespace App\Http\Controllers\API\AI;

use App\Http\Controllers\Controller;
use App\Models\AiHistory;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;

class AIController extends Controller
{
    private string $ollamaUrl;
    private string $defaultModel = 'mistral';

    public function __construct()
    {
        $this->ollamaUrl = config('services.ollama.url', 'http://localhost:11434');
    }

    public function generateProposal(Request $request): JsonResponse
    {
        $request->validate([
            'job_id'             => 'required|exists:job_postings,id',
            'freelancer_summary' => 'nullable|string',
        ]);

        $job = JobPosting::with('category')->findOrFail($request->job_id);
        $user = $request->user();
        $profile = $user->freelancerProfile;

        $prompt = $this->buildProposalPrompt($job, $profile, $request->freelancer_summary);

        $result = $this->callAI($prompt);

        AiHistory::create([
            'user_id'     => $user->id,
            'type'        => 'proposal',
            'input'       => ['job_id' => $job->id, 'job_title' => $job->title],
            'output'      => ['proposal' => $result],
            'model'       => $this->defaultModel,
            'tokens_used' => strlen($result) / 4,
        ]);

        return response()->json(['proposal' => $result]);
    }

    public function matchFreelancers(Request $request): JsonResponse
    {
        $request->validate(['job_id' => 'required|exists:job_postings,id']);

        $job = JobPosting::findOrFail($request->job_id);
        $skills = $job->skills ?? [];

        $freelancers = User::with(['freelancerProfile', 'skills'])
            ->where('role', 'freelancer')
            ->where('is_active', true)
            ->whereHas('skills', fn($q) => $q->whereIn('name', $skills))
            ->orderByDesc('created_at')
            ->limit(10)
            ->get();

        $scored = $freelancers->map(function ($f) use ($skills, $job) {
            $fSkills = $f->skills->pluck('name')->toArray();
            $match = count(array_intersect($fSkills, $skills));
            $total = max(count($skills), 1);
            $score = round(($match / $total) * 100);

            return [
                'user'          => $f,
                'match_score'   => $score,
                'matched_skills'=> array_intersect($fSkills, $skills),
            ];
        })->sortByDesc('match_score')->values();

        return response()->json(['matches' => $scored]);
    }

    public function chat(Request $request): JsonResponse
    {
        $request->validate(['message' => 'required|string|max:2000']);

        $systemPrompt = "You are PANDA AI, a helpful assistant for the PANDA freelance marketplace. You help freelancers find work, write proposals, improve their profiles, and help clients find the right talent. Be concise, professional, and helpful.";

        $result = $this->callAI($request->message, $systemPrompt);

        AiHistory::create([
            'user_id'     => $request->user()->id,
            'type'        => 'chat',
            'input'       => ['message' => $request->message],
            'output'      => ['response' => $result],
            'model'       => $this->defaultModel,
            'tokens_used' => (strlen($request->message) + strlen($result)) / 4,
        ]);

        return response()->json(['response' => $result]);
    }

    public function analyzeProfile(Request $request): JsonResponse
    {
        $user = $request->user()->load('freelancerProfile', 'skills', 'portfolios');
        $profile = $user->freelancerProfile;

        $prompt = "Analyze this freelancer profile and give specific improvement suggestions in JSON format with keys: 'score' (0-100), 'strengths' (array), 'weaknesses' (array), 'suggestions' (array of specific actions). Profile: Title: {$profile->title}, Bio: {$profile->bio}, Skills: " . $user->skills->pluck('name')->join(', ') . ", Hourly rate: \${$profile->hourly_rate}, Experience: {$profile->experience_level}";

        $result = $this->callAI($prompt);

        return response()->json(['analysis' => $result]);
    }

    public function smartSearch(Request $request): JsonResponse
    {
        $request->validate(['query' => 'required|string']);

        $prompt = "Convert this job search query to structured search parameters in JSON format with keys: 'keywords' (array), 'skills' (array), 'budget_range' (object with min/max or null), 'experience_level' (entry/intermediate/expert or null), 'job_type' (hourly/fixed or null). Query: '{$request->query}'";

        $result = $this->callAI($prompt);

        return response()->json(['search_params' => $result]);
    }

    private function buildProposalPrompt(JobPosting $job, $profile, ?string $summary): string
    {
        return "Write a professional, compelling freelance proposal for this job. Be specific, personalized, and persuasive. Keep it under 400 words.

Job Title: {$job->title}
Description: " . substr($job->description, 0, 500) . "
Budget: " . ($job->budget_min ? "\${$job->budget_min} - \${$job->budget_max}" : 'Negotiable') . "
Type: {$job->type}

My Profile:
Title: " . ($profile->title ?? 'Freelancer') . "
Experience: " . ($profile->experience_level ?? 'intermediate') . "
Rate: \$" . ($profile->hourly_rate ?? '50') . "/hr
" . ($summary ? "Additional context: $summary" : '') . "

Write only the proposal text, no meta-commentary.";
    }

    private function callAI(string $prompt, string $system = ''): string
    {
        try {
            $response = Http::timeout(30)->post("{$this->ollamaUrl}/api/generate", [
                'model'  => $this->defaultModel,
                'prompt' => ($system ? "System: $system\n\n" : '') . "User: $prompt",
                'stream' => false,
            ]);

            if ($response->successful()) {
                return $response->json('response', 'AI service temporarily unavailable. Please try again.');
            }
        } catch (\Exception $e) {
            // Fallback response if Ollama is not available
        }

        return $this->getFallbackResponse($prompt);
    }

    private function getFallbackResponse(string $prompt): string
    {
        if (str_contains(strtolower($prompt), 'proposal')) {
            return "Dear Hiring Manager,\n\nI am excited to apply for this position. With my extensive experience in the field, I am confident I can deliver exceptional results that exceed your expectations.\n\nI have carefully reviewed your requirements and I believe my skills align perfectly with what you're looking for. I am committed to delivering high-quality work on time and within budget.\n\nI look forward to discussing how I can contribute to your project's success.\n\nBest regards";
        }
        return "I'm here to help! As your PANDA AI assistant, I can help you with proposals, profile optimization, job searching, and more. What would you like to know?";
    }
}
