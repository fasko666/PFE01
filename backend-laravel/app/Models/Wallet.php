<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Wallet extends Model {
    use HasFactory;
    protected $fillable = ['user_id','balance','pending_balance','escrow_balance','currency'];
    protected $casts = ['balance'=>'decimal:2','pending_balance'=>'decimal:2','escrow_balance'=>'decimal:2'];
    public function user()         { return $this->belongsTo(User::class); }
    public function transactions() { return $this->hasMany(Transaction::class); }
}
