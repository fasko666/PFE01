<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyInvitation extends Model
{
    protected $fillable = ['agency_id', 'invited_by', 'email', 'role', 'token', 'status', 'expires_at', 'responded_at'];
    protected $casts    = ['expires_at' => 'datetime', 'responded_at' => 'datetime'];

    public function agency()  { return $this->belongsTo(Agency::class); }
    public function inviter() { return $this->belongsTo(User::class, 'invited_by'); }

    public function isOpen(): bool
    {
        return $this->status === 'pending' && (! $this->expires_at || $this->expires_at->isFuture());
    }
}
