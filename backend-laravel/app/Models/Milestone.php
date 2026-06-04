<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Milestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'contract_id', 'created_by', 'title', 'description', 'amount', 'status',
        'due_at', 'submitted_at', 'approved_at', 'submission_notes',
        'submitted_by', 'rejection_reason', 'attachments', 'sort_order',
    ];

    protected $casts = [
        'amount'        => 'decimal:2',
        'due_at'        => 'datetime',
        'submitted_at'  => 'datetime',
        'approved_at'   => 'datetime',
        'attachments'   => 'array',
    ];

    public function contract()  { return $this->belongsTo(Contract::class); }
    public function creator()   { return $this->belongsTo(User::class, 'created_by'); }
    public function submitter() { return $this->belongsTo(User::class, 'submitted_by'); }
}
