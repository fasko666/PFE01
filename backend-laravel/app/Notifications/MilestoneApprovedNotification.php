<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\Milestone;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class MilestoneApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Milestone $milestone, public float $payout) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim((string) config('app.url'), '/') . "/contracts/{$this->milestone->contract_id}";
        return (new MailMessage)
            ->subject("Milestone approved: \"{$this->milestone->title}\"")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your client approved the milestone and \${$this->payout} was released to your wallet.")
            ->action('View payment', rtrim((string) config('app.url'), '/') . '/payments')
            ->line("Milestone: {$this->milestone->title}");
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'payment',
            'title'        => 'Milestone payment released',
            'body'         => "\${$this->payout} released for \"{$this->milestone->title}\".",
            'milestone_id' => $this->milestone->id,
            'action_url'   => "/contracts/{$this->milestone->contract_id}",
            'icon'         => 'check-circle',
        ];
    }

    public function broadcastOn(): array { return []; }
    public function shouldBroadcast(): bool { return false; }

    public function toBroadcast(object $notifiable): array
    {
        $unread = DB::table('notifications')->where('notifiable_id', $notifiable->getKey())
            ->where('notifiable_type', get_class($notifiable))->whereNull('read_at')->count();
        broadcast(new NotificationCreated($notifiable->getKey(), $this->toArray($notifiable), $unread));
        return [];
    }
}
