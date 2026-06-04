<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SubscriptionItem extends Model
{
    protected $fillable = ['subscription_id', 'stripe_id', 'stripe_product', 'stripe_price', 'quantity'];

    public function subscription() { return $this->belongsTo(Subscription::class); }
}
