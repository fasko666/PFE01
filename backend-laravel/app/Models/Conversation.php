<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Conversation extends Model {
    use HasFactory;
    protected $fillable = ['type','contract_id','job_id','title','last_message_at'];
    protected $casts = ['last_message_at'=>'datetime'];
    public function participants() { return $this->belongsToMany(User::class,'conversation_participants')->withPivot('last_read_at','is_muted')->withTimestamps(); }
    public function messages()     { return $this->hasMany(Message::class); }
    public function lastMessage()  { return $this->hasOne(Message::class)->latestOfMany(); }
    public function contract()     { return $this->belongsTo(Contract::class); }
    public function job()          { return $this->belongsTo(JobPosting::class); }
}
