<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class ContractExtension extends Model
{
    protected $fillable = ['contract_id','requested_by','new_deadline','additional_budget','new_milestones','reason','status','responded_by','responded_at','response_notes'];
    protected $casts    = ['new_milestones'=>'array','additional_budget'=>'decimal:2','new_deadline'=>'datetime','responded_at'=>'datetime'];

    public function contract()  { return $this->belongsTo(Contract::class); }
    public function requester() { return $this->belongsTo(User::class, 'requested_by'); }
    public function responder() { return $this->belongsTo(User::class, 'responded_by'); }
}
