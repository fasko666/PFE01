<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Transaction extends Model {
    use HasFactory;
    protected $fillable = ['wallet_id','user_id','contract_id','milestone_id','reference','type','amount','fee','currency','status','description','metadata','payment_method','stripe_payment_id'];
    protected $casts = ['amount'=>'decimal:2','fee'=>'decimal:2','metadata'=>'array'];
    public function wallet()    { return $this->belongsTo(Wallet::class); }
    public function user()      { return $this->belongsTo(User::class); }
    public function contract()  { return $this->belongsTo(Contract::class); }
    public function milestone() { return $this->belongsTo(Milestone::class); }
}
