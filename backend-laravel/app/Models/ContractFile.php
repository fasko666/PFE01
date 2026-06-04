<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ContractFile extends Model
{
    use SoftDeletes;
    protected $fillable = ['contract_id','uploader_id','parent_id','original_name','stored_path','mime_type','size_bytes','version','description'];

    public function contract() { return $this->belongsTo(Contract::class); }
    public function uploader() { return $this->belongsTo(User::class, 'uploader_id'); }
    public function parent()   { return $this->belongsTo(ContractFile::class, 'parent_id'); }
    public function versions() { return $this->hasMany(ContractFile::class, 'parent_id')->orderBy('version','desc'); }
}
