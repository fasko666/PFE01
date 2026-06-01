<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\Auth\AuthController;
use App\Http\Controllers\API\Jobs\JobController;
use App\Http\Controllers\API\Jobs\ProposalController;
use App\Http\Controllers\API\Freelancer\FreelancerController;
use App\Http\Controllers\API\Chat\ChatController;
use App\Http\Controllers\API\Payments\PaymentController;
use App\Http\Controllers\API\AI\AIController;
use App\Http\Controllers\API\Admin\AdminController;
use App\Http\Controllers\API\Notifications\NotificationController;
use App\Http\Controllers\API\Reviews\ReviewController;

// ─── Public Routes ─────────────────────────────────────────────────────────
// Rate-limited to prevent brute-force / credential stuffing on auth endpoints
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

Route::get('/jobs',              [JobController::class, 'index']);
Route::get('/jobs/{job}',        [JobController::class, 'show']);
Route::get('/categories',        [JobController::class, 'categories']);
Route::get('/freelancers',       [FreelancerController::class, 'index']);
Route::get('/freelancers/{username}', [FreelancerController::class, 'show']);
Route::get('/reviews/freelancer/{userId}', [ReviewController::class, 'forFreelancer']);

// ─── Authenticated Routes ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',                [AuthController::class, 'logout']);
        Route::get('/me',                     [AuthController::class, 'me']);
        Route::put('/profile',                [AuthController::class, 'updateProfile']);
        Route::put('/change-password',        [AuthController::class, 'changePassword']);
        Route::post('/resend-verification',   [AuthController::class, 'resendVerification']);
        Route::post('/verify-phone',          [AuthController::class, 'verifyPhone']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/',             [NotificationController::class, 'index']);
        Route::post('/read-all',    [NotificationController::class, 'markAllRead']);
        Route::post('/{id}/read',   [NotificationController::class, 'markRead']);
    });

    // Jobs
    Route::prefix('jobs')->group(function () {
        Route::post('/',                [JobController::class, 'store']);
        Route::put('/{job}',            [JobController::class, 'update']);
        Route::delete('/{job}',         [JobController::class, 'destroy']);
        Route::post('/{job}/save',      [JobController::class, 'save']);
        Route::get('/my/postings',      [JobController::class, 'myJobs']);

        // Proposals
        Route::get('/{job}/proposals',  [ProposalController::class, 'index']);
        Route::post('/{job}/proposals', [ProposalController::class, 'store']);
    });

    Route::prefix('proposals')->group(function () {
        Route::get('/my',                       [ProposalController::class, 'myProposals']);
        Route::post('/{proposal}/accept',       [ProposalController::class, 'accept']);
        Route::post('/{proposal}/reject',       [ProposalController::class, 'reject']);
    });

    // Freelancer
    Route::prefix('freelancer')->group(function () {
        Route::put('/profile',                  [FreelancerController::class, 'updateProfile']);
        Route::post('/onboarding',              [FreelancerController::class, 'onboarding']);
        Route::post('/skills',                  [FreelancerController::class, 'addSkills']);
        Route::post('/portfolio',               [FreelancerController::class, 'storePortfolio']);
        Route::delete('/portfolio/{portfolio}', [FreelancerController::class, 'destroyPortfolio']);
        Route::get('/dashboard',                [FreelancerController::class, 'dashboard']);
    });

    // Chat
    Route::prefix('chat')->group(function () {
        Route::get('/conversations',                              [ChatController::class, 'conversations']);
        Route::post('/conversations/start',                       [ChatController::class, 'startConversation']);
        Route::get('/conversations/{conversationId}/messages',    [ChatController::class, 'messages']);
        Route::post('/conversations/{conversationId}/send',       [ChatController::class, 'sendMessage']);
    });

    // Payments
    Route::prefix('payments')->group(function () {
        Route::get('/wallet',                                  [PaymentController::class, 'wallet']);
        Route::get('/overview',                               [PaymentController::class, 'overview']);
        Route::post('/deposit',                               [PaymentController::class, 'deposit']);
        Route::post('/contracts/{contract}/fund-escrow',      [PaymentController::class, 'fundEscrow']);
        Route::post('/milestones/{milestone}/release',        [PaymentController::class, 'releaseMilestone']);
    });

    // AI — rate-limited (cost protection: AI calls hit a paid LLM upstream)
    Route::prefix('ai')->middleware('throttle:20,1')->group(function () {
        Route::post('/generate-proposal',   [AIController::class, 'generateProposal']);
        Route::post('/match-freelancers',   [AIController::class, 'matchFreelancers']);
        Route::post('/chat',                [AIController::class, 'chat']);
        Route::post('/analyze-profile',     [AIController::class, 'analyzeProfile']);
        Route::post('/smart-search',        [AIController::class, 'smartSearch']);
    });

    // Reviews
    Route::post('/reviews',             [ReviewController::class, 'store']);
    Route::delete('/reviews/{review}',  [ReviewController::class, 'destroy']);

    // Admin — protected by admin middleware (defense in depth: also checked in controller)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('/dashboard',            [AdminController::class, 'dashboard']);
        Route::get('/users',                [AdminController::class, 'users']);
        Route::post('/users/{user}/ban',    [AdminController::class, 'banUser']);
        Route::post('/users/{user}/verify', [AdminController::class, 'verifyUser']);
        Route::get('/analytics',            [AdminController::class, 'analytics']);
    });
});
