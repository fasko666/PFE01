<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SavedFreelancer extends Model
{
    protected $fillable = ['user_id', 'freelancer_id'];

    public function user()       { return $this->belongsTo(User::class); }
    public function freelancer() { return $this->belongsTo(User::class, 'freelancer_id'); }
}
