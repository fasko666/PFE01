<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'job_id', 'proposal_id', 'client_id', 'freelancer_id',
        'title', 'description', 'type', 'amount', 'escrow_amount',
        'status', 'started_at', 'ended_at', 'deadline_at', 'terms',
        // dispute / cancel / complete audit fields
        'dispute_reason', 'disputed_at', 'dispute_opened_by',
        'resolved_at', 'resolved_by', 'resolution_outcome',
        'cancellation_reason', 'cancelled_by',
        'completed_by',
        'archived_at',
        // Hourly billing fields
        'hourly_rate', 'weekly_limit', 'auto_invoice_at', 'billing_status',
    ];

    protected $casts = [
        'amount'           => 'decimal:2',
        'escrow_amount'    => 'decimal:2',
        'hourly_rate'      => 'decimal:2',
        'started_at'       => 'datetime',
        'ended_at'         => 'datetime',
        'deadline_at'      => 'datetime',
        'disputed_at'      => 'datetime',
        'resolved_at'      => 'datetime',
        'archived_at'      => 'datetime',
        'auto_invoice_at'  => 'datetime',
    ];

    // Terminal statuses — never mutated after entering one of these
    public const TERMINAL_STATUSES = ['completed', 'cancelled'];

    // Status transitions allowed by the state machine
    public const ALLOWED_TRANSITIONS = [
        'pending'   => ['active', 'cancelled'],
        'active'    => ['paused', 'completed', 'cancelled', 'disputed'],
        'paused'    => ['active', 'cancelled', 'disputed'],
        'disputed'  => ['active', 'completed', 'cancelled'],  // admin-only
        'completed' => [],
        'cancelled' => [],
    ];

    /* ── Relationships ───────────────────────────────────────────────────── */
    public function job()           { return $this->belongsTo(JobPosting::class); }
    public function proposal()      { return $this->belongsTo(Proposal::class); }
    public function client()        { return $this->belongsTo(User::class, 'client_id'); }
    public function freelancer()    { return $this->belongsTo(User::class, 'freelancer_id'); }
    public function milestones()    { return $this->hasMany(Milestone::class); }
    public function reviews()       { return $this->hasMany(Review::class); }
    public function conversation()  { return $this->hasOne(Conversation::class); }
    public function disputeOpener() { return $this->belongsTo(User::class, 'dispute_opened_by'); }
    public function resolver()      { return $this->belongsTo(User::class, 'resolved_by'); }
    public function canceller()     { return $this->belongsTo(User::class, 'cancelled_by'); }
    public function completer()     { return $this->belongsTo(User::class, 'completed_by'); }
    public function files()         { return $this->hasMany(ContractFile::class)->whereNull('parent_id'); }
    public function activities()    { return $this->hasMany(ContractActivity::class)->orderByDesc('created_at'); }
    public function timeLogs()      { return $this->hasMany(TimeLog::class); }
    public function extensions()    { return $this->hasMany(ContractExtension::class)->orderByDesc('created_at'); }

    /* ── Helpers ─────────────────────────────────────────────────────────── */

    /** True if the user is the client or freelancer on this contract. */
    public function hasParticipant(int $userId): bool
    {
        return (int) $this->client_id === $userId || (int) $this->freelancer_id === $userId;
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, self::TERMINAL_STATUSES, true);
    }

    public function canTransitionTo(string $target): bool
    {
        return in_array($target, self::ALLOWED_TRANSITIONS[$this->status] ?? [], true);
    }
}
