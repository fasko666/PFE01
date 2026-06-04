<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IdentityVerification extends Model
{
    protected $fillable = [
        'user_id', 'document_type', 'document_number', 'country',
        'id_front_path', 'id_back_path', 'selfie_path',
        'status', 'reviewed_by', 'submitted_at', 'reviewed_at', 'rejection_reason',
    ];
    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at'  => 'datetime',
    ];

    public function user()     { return $this->belongsTo(User::class); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewed_by'); }
}
