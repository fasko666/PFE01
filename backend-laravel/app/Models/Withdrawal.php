<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends Model
{
    protected $fillable = [
        'user_id', 'wallet_id', 'amount', 'fee', 'net', 'currency',
        'method', 'payout_details', 'status', 'reviewed_by', 'reviewed_at',
        'rejection_reason', 'external_ref', 'completed_at',
    ];

    protected $casts = [
        'amount'         => 'decimal:2',
        'fee'            => 'decimal:2',
        'net'            => 'decimal:2',
        'payout_details' => 'array',
        'reviewed_at'    => 'datetime',
        'completed_at'   => 'datetime',
    ];

    protected $hidden = ['payout_details']; // sensitive; only exposed via dedicated admin endpoint

    public function user(): BelongsTo     { return $this->belongsTo(User::class); }
    public function wallet(): BelongsTo   { return $this->belongsTo(Wallet::class); }
    public function reviewer(): BelongsTo { return $this->belongsTo(User::class, 'reviewed_by'); }
}
