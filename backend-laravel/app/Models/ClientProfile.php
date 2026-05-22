<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class ClientProfile extends Model {
    use HasFactory;
    protected $fillable = ['user_id','company_name','company_size','industry','about','total_jobs_posted','total_spent','avg_rating','total_reviews','payment_verified','preferred_payment_method'];
    protected $casts = ['payment_verified'=>'boolean','avg_rating'=>'decimal:2'];
    public function user() { return $this->belongsTo(User::class); }
}
