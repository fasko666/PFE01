<?php

namespace App\Policies;

use App\Models\User;
use App\Models\WeeklyInvoice;

class WeeklyInvoicePolicy
{
    public function view(User $user, WeeklyInvoice $invoice): bool
    {
        return $user->role === 'admin'
            || (int) $invoice->client_id === (int) $user->id
            || (int) $invoice->freelancer_id === (int) $user->id;
    }
}
