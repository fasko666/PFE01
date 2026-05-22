<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class JobPosting extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'job_postings';

    protected $fillable = [
        'client_id', 'title', 'description', 'category_id', 'skills', 'type',
        'experience_level', 'budget_min', 'budget_max', 'duration',
        'status', 'visibility', 'location_requirement', 'attachments',
        'proposals_count', 'views_count', 'is_featured', 'is_urgent', 'expires_at',
    ];

    protected $casts = [
        'skills'      => 'array',
        'attachments' => 'array',
        'is_featured' => 'boolean',
        'is_urgent'   => 'boolean',
        'expires_at'  => 'datetime',
        'budget_min'  => 'decimal:2',
        'budget_max'  => 'decimal:2',
    ];

    protected $appends = ['skills_required', 'job_type', 'project_duration', 'location', 'is_remote'];

    // Aliases for frontend compatibility
    public function getSkillsRequiredAttribute(): array { return $this->skills ?? []; }
    public function getJobTypeAttribute(): string        { return $this->type ?? 'fixed'; }
    public function getProjectDurationAttribute(): ?string { return $this->duration; }
    public function getLocationAttribute(): ?string       { return $this->location_requirement; }
    public function getIsRemoteAttribute(): bool         { return !$this->location_requirement || str_contains(strtolower($this->location_requirement ?? ''), 'remote'); }

    public function client()    { return $this->belongsTo(User::class, 'client_id'); }
    public function category()  { return $this->belongsTo(Category::class); }
    public function proposals() { return $this->hasMany(Proposal::class, 'job_id'); }
    public function contracts() { return $this->hasMany(Contract::class, 'job_id'); }
    public function savedBy()   { return $this->belongsToMany(User::class, 'saved_jobs')->withTimestamps(); }
}
