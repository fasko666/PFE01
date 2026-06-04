<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id'     => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect'      => env('GOOGLE_REDIRECT_URI', 'http://localhost:8000/auth/google/callback'),
    ],

    'stripe' => [
        'secret'         => env('STRIPE_SECRET'),                     // sk_test_... or sk_live_...
        'publishable'    => env('STRIPE_PUBLISHABLE'),                // pk_test_... or pk_live_...
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),             // whsec_...
        'success_url'    => env('STRIPE_SUCCESS_URL', env('FRONTEND_URL').'/payments/success?session_id={CHECKOUT_SESSION_ID}'),
        'cancel_url'     => env('STRIPE_CANCEL_URL',  env('FRONTEND_URL').'/payments/cancel'),
        'connect_refresh_url' => env('STRIPE_CONNECT_REFRESH_URL', env('FRONTEND_URL').'/payments/connect/refresh'),
        'connect_return_url'  => env('STRIPE_CONNECT_RETURN_URL',  env('FRONTEND_URL').'/payments/connect/return'),
    ],

];
