<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Proposal extends Model {
    use HasFactory;
    protected $fillable = ['job_id','freelancer_id','cover_letter','bid_amount','bid_type','estimated_duration','duration_unit','milestones','attachments','status','is_ai_generated','connects_used'];
    protected $casts = ['milestones'=>'array','attachments'=>'array','is_ai_generated'=>'boolean','bid_amount'=>'decimal:2'];
    public function job()        { return $this->belongsTo(JobPosting::class); }
    public function freelancer() { return $this->belongsTo(User::class,'freelancer_id'); }
    public function contract()   { return $this->hasOne(Contract::class); }
}
