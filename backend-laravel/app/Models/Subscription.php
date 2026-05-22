<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Subscription extends Model {
    use HasFactory;
    protected $fillable = ['user_id','plan','stripe_subscription_id','connects_balance','monthly_fee','status','trial_ends_at','current_period_end'];
    protected $casts = ['trial_ends_at'=>'datetime','current_period_end'=>'datetime','monthly_fee'=>'decimal:2'];
    public function user() { return $this->belongsTo(User::class); }
}
