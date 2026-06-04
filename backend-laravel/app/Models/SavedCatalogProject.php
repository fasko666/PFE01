<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedCatalogProject extends Model
{
    protected $fillable = ['user_id', 'catalog_project_id'];
    public function user()    { return $this->belongsTo(User::class); }
    public function project() { return $this->belongsTo(CatalogProject::class, 'catalog_project_id'); }
}
