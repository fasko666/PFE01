<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AgencyMember extends Model
{
    protected $fillable = ['agency_id', 'user_id', 'role', 'joined_at'];
    protected $casts    = ['joined_at' => 'datetime'];

    public function agency() { return $this->belongsTo(Agency::class); }
    public function user()   { return $this->belongsTo(User::class); }
}
