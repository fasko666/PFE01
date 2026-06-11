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
use App\Http\Controllers\API\Contracts\ContractController;
use App\Http\Controllers\API\Contracts\MilestoneController;
use App\Http\Controllers\API\Contracts\ContractFileController;
use App\Http\Controllers\API\Contracts\TimeTrackingController;
use App\Http\Controllers\API\Contracts\ContractExtensionController;
use App\Http\Controllers\API\Contracts\ContractAnalyticsController;
use App\Http\Controllers\API\Contracts\ContractPdfController;
use App\Http\Controllers\API\Auth\PasswordResetController;
use App\Http\Controllers\API\Auth\TwoFactorController;
use App\Http\Controllers\API\KYC\IdentityVerificationController;
use App\Http\Controllers\API\Talent\SavedFreelancerController;
use App\Http\Controllers\API\Talent\TalentListController;
use App\Http\Controllers\API\Tax\TaxDocumentController;
use App\Http\Controllers\API\Search\SearchController;
use App\Http\Controllers\API\PushNotifications\PushSubscriptionController;
use App\Http\Controllers\API\Billing\SubscriptionController;
use App\Http\Controllers\API\Billing\WeeklyInvoiceController;
use App\Http\Controllers\API\Agency\AgencyController;
use App\Http\Controllers\API\Catalog\CatalogProjectController;
use App\Http\Controllers\API\Catalog\CatalogOrderController;

// ─── Public Routes ─────────────────────────────────────────────────────────
// Rate-limited to prevent brute-force / credential stuffing on auth endpoints
Route::prefix('auth')->middleware('throttle:10,1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Password reset — stricter throttle to defeat reset-spam
Route::prefix('auth')->middleware('throttle:5,1')->group(function () {
    Route::post('/forgot-password', [PasswordResetController::class, 'forgot']);
    Route::post('/reset-password',  [PasswordResetController::class, 'reset']);
});

Route::get('/jobs',              [JobController::class, 'index']);
Route::get('/jobs/{job}',        [JobController::class, 'show']);
Route::get('/categories',        [JobController::class, 'categories']);
Route::get('/freelancers',       [FreelancerController::class, 'index']);
Route::get('/freelancers/{username}', [FreelancerController::class, 'show']);
Route::get('/reviews/freelancer/{userId}', [ReviewController::class, 'forFreelancer']);

// Public search (lightweight — autocomplete + lists without sensitive scopes)
Route::get('/search',         [SearchController::class, 'search'])->middleware('throttle:60,1');
Route::get('/search/suggest', [SearchController::class, 'suggest'])->middleware('throttle:120,1');

// Plans catalog (public — pricing page reads this)
Route::get('/plans', [SubscriptionController::class, 'plans']);

// Catalog marketplace — browsing is public, purchase requires auth
Route::get('/catalog',                       [CatalogProjectController::class, 'index']);
Route::get('/catalog/{catalogProject:slug}', [CatalogProjectController::class, 'show']);

// Agency public directory — bound by id (test uses numeric); slug also works via
// Route Model Binding because we accept the default 'id' resolution.
Route::get('/agencies',            [AgencyController::class, 'index']);
Route::get('/agencies/{agency}',   [AgencyController::class, 'show']);

// Stripe webhook — public (signature-verified inside the controller), no auth, no CSRF.
Route::post('/payments/stripe/webhook', [\App\Http\Controllers\API\Payments\StripeWebhookController::class, 'handle'])
    ->name('stripe.webhook');

// ─── Authenticated Routes ───────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('/logout',                [AuthController::class, 'logout']);
        Route::get('/me',                     [AuthController::class, 'me']);
        Route::put('/profile',                [AuthController::class, 'updateProfile']);
        Route::post('/avatar',               [AuthController::class, 'updateAvatar']);
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

    // Identity verification (KYC) — user-facing
    Route::get('/verify-identity/status', [IdentityVerificationController::class, 'status']);
    Route::post('/verify-identity',       [IdentityVerificationController::class, 'store']);

    // Saved freelancers (quick bookmarks)
    Route::get('/saved-freelancers',                   [SavedFreelancerController::class, 'index']);
    Route::post('/saved-freelancers',                  [SavedFreelancerController::class, 'store']);
    Route::delete('/saved-freelancers/{freelancer}',   [SavedFreelancerController::class, 'destroy']);
    Route::get('/saved-freelancers/check/{freelancer}',[SavedFreelancerController::class, 'check']);

    // Talent lists (named curated groups)
    Route::get   ('/talent-lists',                                  [TalentListController::class, 'index']);
    Route::post  ('/talent-lists',                                  [TalentListController::class, 'store']);
    Route::get   ('/talent-lists/{talentList}',                     [TalentListController::class, 'show']);
    Route::put   ('/talent-lists/{talentList}',                     [TalentListController::class, 'update']);
    Route::delete('/talent-lists/{talentList}',                     [TalentListController::class, 'destroy']);
    Route::post  ('/talent-lists/{talentList}/members',             [TalentListController::class, 'addMember']);
    Route::delete('/talent-lists/{talentList}/members/{freelancer}',[TalentListController::class, 'removeMember']);

    // Tax documents (W-9 / W-8BEN / VAT)
    Route::get ('/tax-documents',                  [TaxDocumentController::class, 'index']);
    Route::post('/tax-documents',                  [TaxDocumentController::class, 'store']);
    Route::get ('/tax-documents/{taxDocument}',    [TaxDocumentController::class, 'show']);
    Route::get ('/tax-documents/{taxDocument}/pdf',[TaxDocumentController::class, 'pdf']);

    // Web Push subscriptions
    Route::get   ('/push/vapid-public-key', [PushSubscriptionController::class, 'vapidPublicKey']);
    Route::post  ('/push/subscribe',        [PushSubscriptionController::class, 'subscribe']);
    Route::delete('/push/subscribe',        [PushSubscriptionController::class, 'unsubscribe']);

    // Billing & subscriptions
    Route::prefix('billing')->group(function () {
        Route::get ('/subscription', [SubscriptionController::class, 'current']);
        Route::post('/checkout',     [SubscriptionController::class, 'checkout']);
        Route::post('/swap',         [SubscriptionController::class, 'swap']);
        Route::post('/cancel',       [SubscriptionController::class, 'cancel']);
        Route::post('/resume',       [SubscriptionController::class, 'resume']);
        Route::get ('/portal',       [SubscriptionController::class, 'portal']);
        Route::get ('/invoices',     [SubscriptionController::class, 'invoices']);

        // Hourly billing — weekly invoices
        Route::get('/invoices/weekly',                  [WeeklyInvoiceController::class, 'index']);
        Route::get('/invoices/weekly/earnings',         [WeeklyInvoiceController::class, 'earnings']);
        Route::get('/invoices/weekly/spending',         [WeeklyInvoiceController::class, 'spending']);
        Route::get('/invoices/weekly/{weeklyInvoice}',  [WeeklyInvoiceController::class, 'show']);
    });

    // Catalog (productized services) — author + purchase actions
    Route::prefix('catalog')->group(function () {
        Route::get   ('/me/saved',                                  [CatalogProjectController::class, 'saved']);
        Route::post  ('/',                                          [CatalogProjectController::class, 'store']);
        Route::put   ('/{catalogProject:slug}',                     [CatalogProjectController::class, 'update']);
        Route::delete('/{catalogProject:slug}',                     [CatalogProjectController::class, 'destroy']);
        Route::post  ('/{catalogProject:slug}/save',                [CatalogProjectController::class, 'save']);
        Route::delete('/{catalogProject:slug}/save',                [CatalogProjectController::class, 'unsave']);

        // Checkout — buyer purchases a tier
        Route::post  ('/{catalogProject:slug}/orders/checkout',     [CatalogOrderController::class, 'checkout']);

        // Order management
        Route::get   ('/orders/mine',                               [CatalogOrderController::class, 'mine']);
        Route::get   ('/orders/{catalogOrder}',                     [CatalogOrderController::class, 'show']);
        Route::post  ('/orders/{catalogOrder}/deliver',             [CatalogOrderController::class, 'deliver']);
        Route::post  ('/orders/{catalogOrder}/complete',            [CatalogOrderController::class, 'complete']);
        Route::post  ('/orders/{catalogOrder}/review',              [CatalogOrderController::class, 'review']);
    });

    // Agencies — owner/admin management + invitations
    Route::prefix('agencies')->group(function () {
        Route::post  ('/',                                  [AgencyController::class, 'store']);

        // Invitation responses — must come BEFORE /{agency} to avoid binding
        // collision with the literal "invitations" path segment.
        Route::post  ('/invitations/{token}/accept',        [AgencyController::class, 'acceptInvitation']);
        Route::post  ('/invitations/{token}/decline',       [AgencyController::class, 'declineInvitation']);

        Route::put   ('/{agency}',                          [AgencyController::class, 'update']);
        Route::delete('/{agency}',                          [AgencyController::class, 'destroy']);

        // Members
        Route::get   ('/{agency}/members',                  [AgencyController::class, 'members']);
        Route::post  ('/{agency}/invitations',              [AgencyController::class, 'invite']);
        Route::delete('/{agency}/members/{member}',         [AgencyController::class, 'removeMember']);
        Route::post  ('/{agency}/transfer-ownership',       [AgencyController::class, 'transferOwnership']);
    });

    // Two-Factor (Fortify, after install) — exposed via custom controller for SPA
    Route::prefix('two-factor')->group(function () {
        Route::get('/status',         [TwoFactorController::class, 'status']);
        Route::post('/enable',        [TwoFactorController::class, 'enable']);
        Route::post('/confirm',       [TwoFactorController::class, 'confirm']);
        Route::post('/disable',       [TwoFactorController::class, 'disable']);
        Route::get('/qr-code',        [TwoFactorController::class, 'qrCode']);
        Route::get('/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);
        Route::post('/recovery-codes/regenerate', [TwoFactorController::class, 'regenerateRecoveryCodes']);
    });

    // Jobs
    Route::prefix('jobs')->group(function () {
        Route::post('/',                [JobController::class, 'store']);
        Route::put('/{job}',            [JobController::class, 'update']);
        Route::delete('/{job}',         [JobController::class, 'destroy']);
        Route::post('/{job}/save',      [JobController::class, 'save']);
        Route::get('/my/postings',      [JobController::class, 'myJobs']);
        Route::get('/my/saved',         [JobController::class, 'mySavedJobs']);

        // Proposals
        Route::get('/{job}/proposals',  [ProposalController::class, 'index']);
        Route::post('/{job}/proposals', [ProposalController::class, 'store']);
    });

    Route::prefix('proposals')->group(function () {
        Route::get('/my',                        [ProposalController::class, 'myProposals']);
        Route::post('/{proposal}/accept',        [ProposalController::class, 'accept']);
        Route::post('/{proposal}/reject',        [ProposalController::class, 'reject']);
        Route::post('/{proposal}/withdraw',      [ProposalController::class, 'withdraw']);
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
        // Existing (unchanged REST contract)
        Route::get('/conversations',                              [ChatController::class, 'conversations']);
        Route::post('/conversations/start',                       [ChatController::class, 'startConversation']);
        Route::get('/conversations/{conversationId}/messages',    [ChatController::class, 'messages']);
        Route::post('/conversations/{conversationId}/send',       [ChatController::class, 'sendMessage']);

        // New (realtime + interactions)
        Route::get('/conversations/search',                       [ChatController::class, 'search']);
        Route::post('/conversations/{conversationId}/typing',     [ChatController::class, 'typing']);
        Route::post('/conversations/{conversationId}/read',       [ChatController::class, 'markRead']);
        Route::post('/messages/{messageId}/delivered',            [ChatController::class, 'markDelivered']);
        Route::put('/messages/{messageId}',                       [ChatController::class, 'editMessage']);
        Route::delete('/messages/{messageId}',                    [ChatController::class, 'deleteMessage']);
        Route::post('/messages/{messageId}/reactions',            [ChatController::class, 'react']);
    });

    // Contracts
    Route::prefix('contracts')->group(function () {
        Route::get('/',                                [ContractController::class, 'index']);
        Route::get('/my/active',                       [ContractController::class, 'myActive']);
        Route::get('/my/completed',                    [ContractController::class, 'myCompleted']);
        Route::get('/my/disputed',                     [ContractController::class, 'myDisputed']);
        Route::get('/{contract}',                      [ContractController::class, 'show']);
        Route::post('/{contract}/complete',            [ContractController::class, 'complete']);
        Route::post('/{contract}/cancel',              [ContractController::class, 'cancel']);
        Route::post('/{contract}/dispute',             [ContractController::class, 'dispute']);
        // Admin-only resolve-dispute is gated by ContractPolicy::resolveDispute
        Route::post('/{contract}/resolve-dispute',     [ContractController::class, 'resolveDispute']);

        // Archive
        Route::post('/{contract}/archive',             [ContractController::class, 'archive']);
        Route::post('/{contract}/unarchive',           [ContractController::class, 'unarchive']);

        // Milestones (scoped to contract)
        Route::get('/{contract}/milestones',           [MilestoneController::class, 'index']);
        Route::post('/{contract}/milestones',          [MilestoneController::class, 'store']);

        // Files
        Route::get('/{contract}/files',                [ContractFileController::class, 'index']);
        Route::post('/{contract}/files',               [ContractFileController::class, 'store']);

        // Time tracking
        Route::get('/{contract}/time',                 [TimeTrackingController::class, 'index']);
        Route::get('/{contract}/time/weekly',          [TimeTrackingController::class, 'weekly']);
        Route::post('/{contract}/time/start',          [TimeTrackingController::class, 'start']);
        Route::post('/{contract}/time/stop',           [TimeTrackingController::class, 'stop']);

        // Extensions
        Route::get('/{contract}/extensions',           [ContractExtensionController::class, 'index']);
        Route::post('/{contract}/extensions',          [ContractExtensionController::class, 'store']);

        // Analytics + activity feed
        Route::get('/{contract}/analytics',            [ContractAnalyticsController::class, 'analytics']);
        Route::get('/{contract}/activity',             [ContractAnalyticsController::class, 'activity']);

        // PDF
        Route::get('/{contract}/pdf',                  [ContractPdfController::class, 'contract']);
        Route::get('/{contract}/dispute-pdf',          [ContractPdfController::class, 'dispute']);
    });

    // Milestone resource by id (show/edit/delete/submit/approve/reject)
    Route::get('/milestones/{milestone}',              [MilestoneController::class, 'show']);
    Route::put('/milestones/{milestone}',              [MilestoneController::class, 'update']);
    Route::delete('/milestones/{milestone}',           [MilestoneController::class, 'destroy']);
    Route::post('/milestones/{milestone}/submit',      [MilestoneController::class, 'submit']);
    Route::post('/milestones/{milestone}/approve',     [MilestoneController::class, 'approve']);
    Route::post('/milestones/{milestone}/reject',      [MilestoneController::class, 'reject']);

    // Contract file resource by id
    Route::get('/contract-files/{file}/download',      [ContractFileController::class, 'download']);
    Route::post('/contract-files/{file}/version',      [ContractFileController::class, 'storeVersion']);
    Route::delete('/contract-files/{file}',            [ContractFileController::class, 'destroy']);

    // Extension respond
    Route::post('/contract-extensions/{extension}/respond', [ContractExtensionController::class, 'respond']);

    // Chat attachment
    Route::post('/chat/conversations/{conversationId}/attachment', [ChatController::class, 'sendAttachment']);

    // Payments
    Route::prefix('payments')->group(function () {
        Route::get('/wallet',                                  [PaymentController::class, 'wallet']);
        Route::get('/overview',                                [PaymentController::class, 'overview']);
        Route::post('/deposit',                                [PaymentController::class, 'deposit']);
        Route::post('/contracts/{contract}/fund-escrow',       [PaymentController::class, 'fundEscrow']);
        Route::post('/milestones/{milestone}/release',         [PaymentController::class, 'releaseMilestone']);

        // Freelancer withdrawals
        Route::get('/withdrawals',  [PaymentController::class, 'myWithdrawals']);
        Route::post('/withdrawals', [PaymentController::class, 'requestWithdrawal']);

        // Stripe integration
        Route::post('/stripe/deposit-session', [\App\Http\Controllers\API\Payments\StripeController::class, 'createDepositSession']);
        Route::post('/stripe/connect/onboard', [\App\Http\Controllers\API\Payments\StripeController::class, 'connectOnboard']);
        Route::get('/stripe/connect/status',   [\App\Http\Controllers\API\Payments\StripeController::class, 'connectStatus']);
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

        // Finance & payment administration
        Route::get('/finance/dashboard',                                [\App\Http\Controllers\API\Admin\AdminFinanceController::class, 'dashboard']);
        Route::get('/finance/withdrawals',                              [\App\Http\Controllers\API\Admin\AdminFinanceController::class, 'withdrawals']);
        Route::post('/finance/withdrawals/{withdrawal}/approve',        [\App\Http\Controllers\API\Admin\AdminFinanceController::class, 'approveWithdrawal']);
        Route::post('/finance/withdrawals/{withdrawal}/reject',         [\App\Http\Controllers\API\Admin\AdminFinanceController::class, 'rejectWithdrawal']);
        Route::get('/finance/settings',                                 [\App\Http\Controllers\API\Admin\AdminFinanceController::class, 'settings']);
        Route::put('/finance/settings',                                 [\App\Http\Controllers\API\Admin\AdminFinanceController::class, 'updateSettings']);

        // Tax documents — admin review
        Route::get ('/tax-documents',                                    [TaxDocumentController::class, 'adminIndex']);
        Route::post('/tax-documents/{taxDocument}/approve',              [TaxDocumentController::class, 'approve']);
        Route::post('/tax-documents/{taxDocument}/reject',               [TaxDocumentController::class, 'reject']);

        // Catalog moderation
        Route::post('/catalog/{catalogProject}/approve', [CatalogProjectController::class, 'approve']);
        Route::post('/catalog/{catalogProject}/reject',  [CatalogProjectController::class, 'reject']);

        // KYC admin queue
        Route::get('/kyc',                                              [IdentityVerificationController::class, 'adminIndex']);
        Route::get('/kyc/{verification}',                               [IdentityVerificationController::class, 'adminShow']);
        Route::post('/kyc/{verification}/approve',                      [IdentityVerificationController::class, 'approve']);
        Route::post('/kyc/{verification}/reject',                       [IdentityVerificationController::class, 'reject']);
        Route::get('/kyc/file/{path}', function ($path) {
            $real = base64_decode($path);
            abort_unless(\Illuminate\Support\Facades\Storage::disk('local')->exists($real), 404);
            return \Illuminate\Support\Facades\Storage::disk('local')->response($real);
        })->name('admin.kyc.file');
    });
});
