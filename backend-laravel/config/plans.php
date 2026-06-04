<?php

/*
|--------------------------------------------------------------------------
| Subscription Plans
|--------------------------------------------------------------------------
|
| Single source of truth for paid plans. Each plan maps to a Stripe Price ID
| (set via env so test/prod keys differ) and a feature flag set used by the
| EnsurePlan middleware and frontend feature-gating UI.
|
| To use:
|   1. Create a Product + Recurring Price in Stripe Dashboard for each tier
|   2. Set STRIPE_PRICE_* in .env to the price_xxx IDs
|   3. The frontend pricing page reads /api/plans and shows enabled plans
*/

return [

    /*
    |--------------------------------------------------------------------------
    | Plan hierarchy
    |--------------------------------------------------------------------------
    |
    | Used by EnsurePlan to compute "X or higher". Lower index = lower tier.
    */
    'hierarchy' => [
        'free',
        'freelancer_plus',
        'client_plus',
        'business',
    ],

    /*
    |--------------------------------------------------------------------------
    | Plan definitions
    |--------------------------------------------------------------------------
    */
    'plans' => [

        'free' => [
            'name'            => 'Free',
            'tagline'         => 'Get started — pay only when you hire',
            'price_monthly'   => 0,
            'price_yearly'    => 0,
            'stripe_price'    => null,         // Free plan is not a Stripe subscription
            'audience'        => ['freelancer', 'client'],
            'featured'        => false,
            'features'        => [
                'connects_monthly'         => 10,
                'job_postings_per_month'   => 5,
                'marketplace_access'       => true,
                'basic_search'             => true,
                'in_app_messaging'         => true,
                'escrow_protection'        => true,
                // gated:
                'priority_support'         => false,
                'see_who_viewed_profile'   => false,
                'featured_freelancer_badge'=> false,
                'team_workspace'           => false,
                'advanced_analytics'       => false,
            ],
        ],

        'freelancer_plus' => [
            'name'            => 'Freelancer Plus',
            'tagline'         => 'Stand out and win more work',
            'price_monthly'   => 14.99,
            'price_yearly'    => 149.00,
            'stripe_price'    => env('STRIPE_PRICE_FREELANCER_PLUS'),
            'audience'        => ['freelancer'],
            'featured'        => true,
            'features'        => [
                'connects_monthly'         => 80,
                'job_postings_per_month'   => 0,        // freelancers don't post jobs
                'marketplace_access'       => true,
                'basic_search'             => true,
                'in_app_messaging'         => true,
                'escrow_protection'        => true,
                'priority_support'         => true,
                'see_who_viewed_profile'   => true,
                'featured_freelancer_badge'=> true,
                'team_workspace'           => false,
                'advanced_analytics'       => false,
            ],
        ],

        'client_plus' => [
            'name'            => 'Client Plus',
            'tagline'         => 'Hire faster with curated shortlists',
            'price_monthly'   => 24.99,
            'price_yearly'    => 249.00,
            'stripe_price'    => env('STRIPE_PRICE_CLIENT_PLUS'),
            'audience'        => ['client'],
            'featured'        => true,
            'features'        => [
                'connects_monthly'         => 0,
                'job_postings_per_month'   => 30,
                'marketplace_access'       => true,
                'basic_search'             => true,
                'in_app_messaging'         => true,
                'escrow_protection'        => true,
                'priority_support'         => true,
                'see_who_viewed_profile'   => true,
                'featured_freelancer_badge'=> false,
                'team_workspace'           => false,
                'advanced_analytics'       => false,
            ],
        ],

        'business' => [
            'name'            => 'Business',
            'tagline'         => 'For teams hiring at scale',
            'price_monthly'   => 49.99,
            'price_yearly'    => 499.00,
            'stripe_price'    => env('STRIPE_PRICE_BUSINESS'),
            'audience'        => ['client'],
            'featured'        => false,
            'features'        => [
                'connects_monthly'         => 0,
                'job_postings_per_month'   => -1,       // unlimited
                'marketplace_access'       => true,
                'basic_search'             => true,
                'in_app_messaging'         => true,
                'escrow_protection'        => true,
                'priority_support'         => true,
                'see_who_viewed_profile'   => true,
                'featured_freelancer_badge'=> false,
                'team_workspace'           => true,
                'advanced_analytics'       => true,
            ],
        ],

    ],

    /*
    |--------------------------------------------------------------------------
    | Connects refill bonuses
    |--------------------------------------------------------------------------
    | When a subscription invoice is paid, top up the user's connects_balance
    | by the plan's `connects_monthly`. Capped to prevent infinite stacking.
    */
    'connects_max_cap' => 200,
];
