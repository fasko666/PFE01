<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class Contract extends Model {
    use HasFactory, SoftDeletes;
    protected $fillable = ['job_id','proposal_id','client_id','freelancer_id','title','description','type','amount','escrow_amount','status','started_at','ended_at','deadline_at','terms'];
    protected $casts = ['amount'=>'decimal:2','escrow_amount'=>'decimal:2','started_at'=>'datetime','ended_at'=>'datetime','deadline_at'=>'datetime'];
    public function job()        { return $this->belongsTo(JobPosting::class); }
    public function proposal()   { return $this->belongsTo(Proposal::class); }
    public function client()     { return $this->belongsTo(User::class,'client_id'); }
    public function freelancer() { return $this->belongsTo(User::class,'freelancer_id'); }
    public function milestones() { return $this->hasMany(Milestone::class); }
    public function reviews()    { return $this->hasMany(Review::class); }
    public function conversation(){ return $this->hasOne(Conversation::class); }
}
