<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CatalogProject extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'seller_id', 'category_id', 'title', 'slug', 'description',
        'tier_basic', 'tier_standard', 'tier_premium', 'faq', 'skills',
        'status', 'moderated_by', 'moderated_at', 'rejection_reason',
        // computed/aggregate fields — written by the controller / scheduler
        'avg_rating', 'reviews_count', 'views_count', 'orders_count',
    ];

    protected $casts = [
        'tier_basic'    => 'array',
        'tier_standard' => 'array',
        'tier_premium'  => 'array',
        'faq'           => 'array',
        'skills'        => 'array',
        'moderated_at'  => 'datetime',
        'avg_rating'    => 'decimal:2',
    ];

    public function seller()   { return $this->belongsTo(User::class, 'seller_id'); }
    public function category() { return $this->belongsTo(Category::class); }
    public function images()   { return $this->hasMany(CatalogProjectImage::class)->orderBy('sort_order'); }
    public function orders()   { return $this->hasMany(CatalogOrder::class); }
    public function reviews()  { return $this->hasMany(CatalogReview::class); }

    public function tier(string $name): ?array
    {
        return match ($name) {
            'basic'    => $this->tier_basic,
            'standard' => $this->tier_standard,
            'premium'  => $this->tier_premium,
            default    => null,
        };
    }
}
