<?php

namespace App\Console\Commands;

use App\Services\HourlyBillingService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class HourlyGenerateInvoicesCommand extends Command
{
    protected $signature = 'hourly:generate-invoices
        {--week-end= : ISO date of the week-end (defaults to last Sunday)}
        {--contract= : Limit to a single contract id}';

    protected $description = 'Generate + pay weekly invoices for hourly contracts';

    public function handle(HourlyBillingService $service): int
    {
        $weekEnd = $this->option('week-end')
            ? Carbon::parse($this->option('week-end'))
            : now()->subWeek()->endOfWeek();

        $this->info("Generating invoices for week ending {$weekEnd->toDateString()}");

        $result = $service->generateForWeekEnding($weekEnd, $this->option('contract') ? (int) $this->option('contract') : null);

        $this->table(
            ['processed', 'paid', 'failed', 'skipped'],
            [[$result['processed'], $result['paid'], $result['failed'], $result['skipped']]]
        );

        return self::SUCCESS;
    }
}
