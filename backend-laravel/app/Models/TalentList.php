<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TalentList extends Model
{
    protected $fillable = ['user_id', 'name', 'description'];

    public function user()        { return $this->belongsTo(User::class); }
    public function freelancers() {
        return $this->belongsToMany(User::class, 'talent_list_freelancers', 'talent_list_id', 'freelancer_id')
            ->withPivot('note')->withTimestamps();
    }
}
