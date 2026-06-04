<?php

namespace App\Listeners;

use App\Events\WeeklyInvoicePaid;
use App\Notifications\WeeklyInvoicePaidNotification;

class NotifyOnWeeklyInvoicePaid
{
    public function handle(WeeklyInvoicePaid $event): void
    {
        $inv = $event->invoice;
        try {
            $inv->freelancer?->notify(new WeeklyInvoicePaidNotification($inv, forFreelancer: true));
            $inv->client?->notify(new WeeklyInvoicePaidNotification($inv, forFreelancer: false));
        } catch (\Throwable $e) {
            \Log::warning('Weekly invoice notify failed', ['err' => $e->getMessage()]);
        }
    }
}
