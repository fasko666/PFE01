<?php

namespace App\Events;

use App\Models\WeeklyInvoice;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class WeeklyInvoiceGenerated
{
    use Dispatchable, SerializesModels;

    public function __construct(public WeeklyInvoice $invoice) {}
}
