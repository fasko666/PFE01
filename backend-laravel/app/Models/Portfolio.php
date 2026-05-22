<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Portfolio extends Model {
    use HasFactory;
    protected $fillable = ['user_id','title','description','project_url','images','skills','completed_at','is_featured','views'];
    protected $casts = ['images'=>'array','skills'=>'array','is_featured'=>'boolean','completed_at'=>'date'];
    public function user() { return $this->belongsTo(User::class); }
}
