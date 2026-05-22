<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Review extends Model {
    use HasFactory;
    protected $fillable = ['contract_id','reviewer_id','reviewee_id','rating','comment','breakdown','is_public'];
    protected $casts = ['breakdown'=>'array','is_public'=>'boolean','rating'=>'decimal:2'];
    public function contract()  { return $this->belongsTo(Contract::class); }
    public function reviewer()  { return $this->belongsTo(User::class,'reviewer_id'); }
    public function reviewee()  { return $this->belongsTo(User::class,'reviewee_id'); }
}
