<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Agency extends Model
{
    use SoftDeletes;

    protected $fillable = ['owner_id', 'name', 'slug', 'description', 'logo_path', 'skills', 'country', 'website'];
    protected $casts    = ['skills' => 'array'];

    public function owner()        { return $this->belongsTo(User::class, 'owner_id'); }
    public function members()      { return $this->hasMany(AgencyMember::class); }
    public function memberUsers()  { return $this->belongsToMany(User::class, 'agency_members')->withPivot('role','joined_at')->withTimestamps(); }
    public function invitations()  { return $this->hasMany(AgencyInvitation::class); }

    public function hasMember(int $userId): bool
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    public function roleOf(int $userId): ?string
    {
        return $this->members()->where('user_id', $userId)->value('role');
    }
}
