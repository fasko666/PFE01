<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
class Message extends Model {
    use HasFactory, SoftDeletes;
    protected $fillable = ['conversation_id','sender_id','body','type','attachments','metadata','is_read','read_at','reply_to_id','edited_at','delivered_at'];
    protected $casts = ['attachments'=>'array','metadata'=>'array','is_read'=>'boolean','read_at'=>'datetime','edited_at'=>'datetime','delivered_at'=>'datetime'];
    public function conversation() { return $this->belongsTo(Conversation::class); }
    public function sender()       { return $this->belongsTo(User::class,'sender_id'); }
    public function replyTo()      { return $this->belongsTo(Message::class,'reply_to_id'); }
    public function replies()      { return $this->hasMany(Message::class,'reply_to_id'); }
    public function reactions()    { return $this->hasMany(MessageReaction::class); }
}
