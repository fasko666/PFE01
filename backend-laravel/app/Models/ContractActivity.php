<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ContractActivity extends Model
{
    public $timestamps = false;
    protected $fillable = ['contract_id','actor_id','type','data','created_at'];
    protected $casts    = ['data'=>'array','created_at'=>'datetime'];

    public function contract() { return $this->belongsTo(Contract::class); }
    public function actor()    { return $this->belongsTo(User::class, 'actor_id'); }
}
