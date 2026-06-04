<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CatalogOrder extends Model
{
    protected $fillable = [
        'catalog_project_id', 'buyer_id', 'seller_id', 'tier', 'price',
        'delivery_days', 'revisions_allowed', 'requirements', 'status',
        'stripe_session_id', 'contract_id', 'conversation_id',
        'paid_at', 'delivered_at', 'completed_at',
    ];
    protected $casts = [
        'price'        => 'decimal:2',
        'paid_at'      => 'datetime',
        'delivered_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function project()      { return $this->belongsTo(CatalogProject::class, 'catalog_project_id'); }
    public function buyer()        { return $this->belongsTo(User::class, 'buyer_id'); }
    public function seller()       { return $this->belongsTo(User::class, 'seller_id'); }
    public function contract()     { return $this->belongsTo(Contract::class); }
    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function review()       { return $this->hasOne(CatalogReview::class); }
}
