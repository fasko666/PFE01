<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class AiHistory extends Model {
    use HasFactory;
    protected $table = 'ai_histories';
    protected $fillable = ['user_id','type','input','output','model','tokens_used'];
    protected $casts = ['input'=>'array','output'=>'array'];
    public function user() { return $this->belongsTo(User::class); }
}
