<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class TimeLog extends Model
{
    protected $fillable = ['contract_id','user_id','started_at','ended_at','duration_seconds','description','screenshot_url'];
    protected $casts    = ['started_at'=>'datetime','ended_at'=>'datetime'];

    public function contract() { return $this->belongsTo(Contract::class); }
    public function user()     { return $this->belongsTo(User::class); }

    public function scopeRunning($q) { return $q->whereNull('ended_at'); }
}
