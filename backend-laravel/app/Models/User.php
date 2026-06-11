<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Mass-assignable fields.
     * SECURITY: 'role', 'is_active', 'is_verified', 'email_verified_at' are
     * intentionally excluded — they must only be set via explicit, audited code
     * paths (registration controller, admin actions, email-verification flow).
     * This prevents privilege escalation if any controller ever passes $request->all().
     */
    protected $fillable = [
        'name','username','email','password',
        'avatar','country','timezone','phone','phone_verified',
        'is_online','last_seen_at',
        'google_id','github_id',
        'connects_balance',
    ];

    protected $hidden = ['password','remember_token','two_factor_secret','two_factor_recovery_codes'];

    protected $appends = ['avatar_url'];

    protected $casts = [
        'email_verified_at'        => 'datetime',
        'last_seen_at'             => 'datetime',
        'two_factor_confirmed_at'  => 'datetime',
        'password'                 => 'hashed',
        'is_verified'              => 'boolean',
        'is_active'                => 'boolean',
        'is_online'                => 'boolean',
        'phone_verified'           => 'boolean',
    ];

    /** @internal — exposed for the auth flow */
    public function hasEnabledTwoFactorAuthentication(): bool
    {
        return ! is_null($this->two_factor_confirmed_at);
    }

    public function freelancerProfile() { return $this->hasOne(FreelancerProfile::class); }
    public function clientProfile()     { return $this->hasOne(ClientProfile::class); }
    public function wallet()            { return $this->hasOne(Wallet::class); }
    /** Subscriptions — Cashier-compatible. `subscription()` returns the active 'default' if any. */
    public function subscriptions()     { return $this->hasMany(Subscription::class); }
    public function subscription(string $type = 'default')
    {
        return $this->hasOne(Subscription::class)->where('type', $type)
            ->orderByDesc('created_at');
    }
    /** True if user has any active subscription of any type (or a specific plan if $slug given). */
    public function subscribed(?string $slug = null, string $type = 'default'): bool
    {
        $sub = $this->subscriptions()->where('type', $type)->latest()->first();
        if (! $sub) return false;
        if ($slug && $sub->plan_slug !== $slug) return false;
        return $sub->active();
    }
    public function skills()            { return $this->belongsToMany(Skill::class,'freelancer_skills')->withPivot('level')->withTimestamps(); }
    public function portfolios()        { return $this->hasMany(Portfolio::class); }
    public function jobPostings()       { return $this->hasMany(JobPosting::class,'client_id'); }
    public function proposals()         { return $this->hasMany(Proposal::class,'freelancer_id'); }
    public function clientContracts()   { return $this->hasMany(Contract::class,'client_id'); }
    public function freelancerContracts(){ return $this->hasMany(Contract::class,'freelancer_id'); }
    public function savedJobs()         { return $this->belongsToMany(JobPosting::class,'saved_jobs')->withTimestamps(); }
    public function conversations()     { return $this->belongsToMany(Conversation::class,'conversation_participants')->withPivot('last_read_at','is_muted')->withTimestamps(); }
    public function sentMessages()      { return $this->hasMany(Message::class,'sender_id'); }
    public function aiHistories()       { return $this->hasMany(AiHistory::class); }

    public function isFreelancer(): bool { return $this->role === 'freelancer'; }
    public function isClient(): bool     { return $this->role === 'client'; }
    public function isAdmin(): bool      { return $this->role === 'admin'; }

    public function getAvatarUrlAttribute(): string
    {
        if ($this->avatar) {
            return str_starts_with($this->avatar, 'http') ? $this->avatar : asset('storage/'.$this->avatar);
        }
        return 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&background=6366f1&color=fff&bold=true';
    }
}
