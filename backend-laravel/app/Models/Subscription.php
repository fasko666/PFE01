<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Native subscription model (Cashier-compatible shape).
 *
 * One row per Stripe subscription. A user can have multiple over time but only
 * one active subscription of a given `type` (default 'default').
 */
class Subscription extends Model
{
    protected $fillable = [
        'user_id', 'type', 'stripe_id', 'stripe_status',
        'stripe_price', 'plan_slug', 'quantity',
        'trial_ends_at', 'ends_at',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'ends_at'       => 'datetime',
    ];

    public function user()  { return $this->belongsTo(User::class); }
    public function items() { return $this->hasMany(SubscriptionItem::class); }

    /* ── Status helpers (Cashier parity) ───────────────────────────────── */

    public function active(): bool
    {
        return in_array($this->stripe_status, ['active', 'trialing'], true)
            && (! $this->ends_at || $this->ends_at->isFuture());
    }

    public function canceled(): bool
    {
        return $this->stripe_status === 'canceled' || $this->ends_at !== null;
    }

    /** True if the user clicked cancel but the paid period is still running. */
    public function onGracePeriod(): bool
    {
        return $this->ends_at && $this->ends_at->isFuture();
    }

    public function onTrial(): bool
    {
        return $this->trial_ends_at && $this->trial_ends_at->isFuture();
    }

    public function pastDue(): bool
    {
        return $this->stripe_status === 'past_due';
    }

    public function recurring(): bool
    {
        return $this->active() && ! $this->onGracePeriod();
    }

    /** Returns the feature flags array from config/plans.php for this plan. */
    public function features(): array
    {
        return (array) config("plans.plans.{$this->plan_slug}.features", []);
    }

    public function hasFeature(string $key): bool
    {
        return (bool) ($this->features()[$key] ?? false);
    }
}
