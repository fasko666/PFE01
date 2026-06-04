<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatalogProjectImage extends Model
{
    protected $fillable = ['catalog_project_id', 'image_url', 'sort_order'];
    public function project() { return $this->belongsTo(CatalogProject::class, 'catalog_project_id'); }
}
