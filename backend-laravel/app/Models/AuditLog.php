<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['actor_id', 'action', 'target_type', 'target_id', 'payload', 'ip_address', 'user_agent', 'created_at'];
    protected $casts    = ['payload' => 'array', 'created_at' => 'datetime'];

    public function actor()  { return $this->belongsTo(User::class, 'actor_id'); }
    public function target() { return $this->morphTo(__FUNCTION__, 'target_type', 'target_id'); }
}
