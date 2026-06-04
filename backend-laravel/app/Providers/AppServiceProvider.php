<?php

namespace App\Providers;

use App\Models\Agency;
use App\Models\CatalogOrder;
use App\Models\CatalogProject;
use App\Models\Contract;
use App\Models\Conversation;
use App\Models\IdentityVerification;
use App\Models\JobPosting;
use App\Models\Message;
use App\Models\Milestone;
use App\Models\Portfolio;
use App\Models\Proposal;
use App\Models\Review;
use App\Models\Subscription;
use App\Models\TalentList;
use App\Models\TaxDocument;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WeeklyInvoice;
use App\Models\Withdrawal;
use App\Policies\AgencyPolicy;
use App\Policies\CatalogOrderPolicy;
use App\Policies\CatalogProjectPolicy;
use App\Policies\ContractPolicy;
use App\Policies\ConversationPolicy;
use App\Policies\JobPolicy;
use App\Policies\KYCPolicy;
use App\Policies\MessagePolicy;
use App\Policies\MilestonePolicy;
use App\Policies\PortfolioPolicy;
use App\Policies\ProposalPolicy;
use App\Policies\ReviewPolicy;
use App\Policies\SubscriptionPolicy;
use App\Policies\TalentListPolicy;
use App\Policies\TaxDocumentPolicy;
use App\Policies\UserPolicy;
use App\Policies\WalletPolicy;
use App\Policies\WeeklyInvoicePolicy;
use App\Policies\WithdrawalPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    /**
     * All Eloquent policies are explicitly registered here because Laravel 12's
     * default skeleton no longer auto-discovers them.
     * Broadcasting routes/channels are registered via withBroadcasting() in
     * bootstrap/app.php.
     */
    public function boot(): void
    {
        Gate::policy(Contract::class,             ContractPolicy::class);
        Gate::policy(Milestone::class,            MilestonePolicy::class);
        Gate::policy(JobPosting::class,           JobPolicy::class);
        Gate::policy(Proposal::class,             ProposalPolicy::class);
        Gate::policy(Review::class,               ReviewPolicy::class);
        Gate::policy(User::class,                 UserPolicy::class);
        Gate::policy(Wallet::class,               WalletPolicy::class);
        Gate::policy(Withdrawal::class,           WithdrawalPolicy::class);
        Gate::policy(Conversation::class,         ConversationPolicy::class);
        Gate::policy(Message::class,              MessagePolicy::class);
        Gate::policy(Portfolio::class,            PortfolioPolicy::class);
        Gate::policy(IdentityVerification::class, KYCPolicy::class);
        Gate::policy(Subscription::class,         SubscriptionPolicy::class);
        Gate::policy(TalentList::class,           TalentListPolicy::class);
        Gate::policy(TaxDocument::class,          TaxDocumentPolicy::class);
        Gate::policy(Agency::class,               AgencyPolicy::class);
        Gate::policy(CatalogProject::class,       CatalogProjectPolicy::class);
        Gate::policy(CatalogOrder::class,         CatalogOrderPolicy::class);
        Gate::policy(WeeklyInvoice::class,        WeeklyInvoicePolicy::class);
    }
}
