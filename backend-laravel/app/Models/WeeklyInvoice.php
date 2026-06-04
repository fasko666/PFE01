<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeeklyInvoice extends Model
{
    protected $fillable = [
        'contract_id', 'client_id', 'freelancer_id',
        'week_start', 'week_end',
        'seconds_worked', 'hours_worked',
        'hourly_rate', 'gross_amount', 'commission', 'net_to_freelancer',
        'status', 'failure_reason', 'processed_at', 'idempotency_key',
    ];

    protected $casts = [
        'week_start'       => 'date',
        'week_end'         => 'date',
        'hours_worked'     => 'decimal:2',
        'hourly_rate'      => 'decimal:2',
        'gross_amount'     => 'decimal:2',
        'commission'       => 'decimal:2',
        'net_to_freelancer'=> 'decimal:2',
        'processed_at'     => 'datetime',
    ];

    public function contract()    { return $this->belongsTo(Contract::class); }
    public function client()      { return $this->belongsTo(User::class, 'client_id'); }
    public function freelancer()  { return $this->belongsTo(User::class, 'freelancer_id'); }
}
