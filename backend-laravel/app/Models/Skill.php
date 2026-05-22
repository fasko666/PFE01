<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Skill extends Model {
    use HasFactory;
    protected $fillable = ['name','slug','category_id','is_active'];
    protected $casts = ['is_active'=>'boolean'];
    public function category()    { return $this->belongsTo(Category::class); }
    public function freelancers() { return $this->belongsToMany(User::class,'freelancer_skills')->withPivot('level')->withTimestamps(); }
}
