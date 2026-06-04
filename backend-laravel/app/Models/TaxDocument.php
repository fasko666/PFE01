<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TaxDocument extends Model
{
    protected $fillable = [
        'user_id', 'form_type', 'country', 'legal_name', 'tax_id_last4',
        'address_line1', 'address_line2', 'city', 'state_region', 'postal_code',
        'form_payload', 'signed_pdf_path', 'status', 'reviewed_by',
        'submitted_at', 'reviewed_at', 'rejection_reason',
    ];

    protected $casts = [
        'form_payload' => 'array',
        'submitted_at' => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function user()     { return $this->belongsTo(User::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
