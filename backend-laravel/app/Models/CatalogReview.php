<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatalogReview extends Model
{
    protected $fillable = ['catalog_project_id', 'catalog_order_id', 'reviewer_id', 'rating', 'comment'];
    protected $casts    = ['rating' => 'decimal:2'];

    public function project()  { return $this->belongsTo(CatalogProject::class, 'catalog_project_id'); }
    public function order()    { return $this->belongsTo(CatalogOrder::class, 'catalog_order_id'); }
    public function reviewer() { return $this->belongsTo(User::class, 'reviewer_id'); }
}
