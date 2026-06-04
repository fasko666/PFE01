<?php

/**
 * Sentry config — installed when you run:
 *   composer require sentry/sentry-laravel
 *   php artisan sentry:publish --dsn=https://...@sentry.io/...
 *
 * Until then this file is harmless (Sentry only activates when SENTRY_LARAVEL_DSN
 * is set AND the sentry-laravel package is installed).
 */
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),

    'breadcrumbs' => [
        'logs'    => true,
        'cache'   => false,
        'livewire'=> false,
        'sql_queries'  => true,
        'sql_bindings' => false,
        'queue_info'   => true,
        'command_info' => true,
        'http_client_requests' => true,
        'notifications'        => true,
    ],

    'tracing' => [
        'queue_job_transactions' => env('SENTRY_TRACE_QUEUE_ENABLED', false),
        'queue_jobs'             => true,
        'sql_queries'            => true,
        'sql_origin'             => true,
        'views'                  => true,
        'livewire'               => false,
        'http_client_requests'   => true,
        'redis_commands'         => env('SENTRY_TRACE_REDIS_COMMANDS', false),
        'missing_routes'         => false,
    ],

    'send_default_pii' => false,
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.0),
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.0),
    'environment' => env('APP_ENV'),
    'release'     => env('SENTRY_RELEASE'),
];
