<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Weekly hourly billing — runs every Monday at 02:00 for the week that just ended.
Schedule::command('hourly:generate-invoices')->weeklyOn(1, '02:00')->withoutOverlapping();
