<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class FreelancerProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'title', 'bio', 'hourly_rate', 'experience_level',
        'availability', 'weekly_hours', 'success_rate', 'total_jobs',
        'total_earned', 'avg_rating', 'total_reviews', 'is_top_rated',
        'is_top_rated_plus', 'is_available', 'profile_visibility',
        'languages', 'video_intro', 'linkedin_url', 'github_url',
        'website_url', 'certifications', 'badges',
    ];

    protected $casts = [
        'languages' => 'array',
        'certifications' => 'array',
        'badges' => 'array',
        'is_top_rated' => 'boolean',
        'is_top_rated_plus' => 'boolean',
        'is_available' => 'boolean',
        'hourly_rate' => 'decimal:2',
        'avg_rating' => 'decimal:2',
    ];

    public function user() { return $this->belongsTo(User::class); }
}
