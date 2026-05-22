<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
class Category extends Model {
    use HasFactory;
    protected $fillable = ['name','slug','icon','description','parent_id','sort_order','is_active'];
    protected $casts = ['is_active'=>'boolean'];
    public function parent()   { return $this->belongsTo(Category::class,'parent_id'); }
    public function children() { return $this->hasMany(Category::class,'parent_id'); }
    public function skills()   { return $this->hasMany(Skill::class); }
    public function jobs()     { return $this->hasMany(JobPosting::class); }
}
