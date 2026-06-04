<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\Proposal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

/**
 * Sent to a client when a freelancer submits a proposal on their job.
 * Channels: mail (transactional email) + database (Laravel notif table) +
 * broadcast (Reverb realtime badge via NotificationCreated event).
 */
class ProposalReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Proposal $proposal) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $job = $this->proposal->job;
        $url = rtrim((string) config('app.url'), '/') . "/jobs/{$job?->id}/proposals";

        return (new MailMessage)
            ->subject("New proposal on \"{$job?->title}\"")
            ->greeting("Hi {$notifiable->name},")
            ->line("A freelancer submitted a proposal for your job \"{$job?->title}\".")
            ->line("Bid: \${$this->proposal->bid_amount}")
            ->action('Review proposal', $url)
            ->line('Reviews and timely responses help you win the best talent.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'proposal',
            'title'       => 'New proposal received',
            'body'        => "A freelancer submitted a proposal on \"{$this->proposal->job?->title}\".",
            'proposal_id' => $this->proposal->id,
            'action_url'  => "/jobs/{$this->proposal->job?->id}/proposals",
            'icon'        => 'file',
        ];
    }

    /**
     * We don't use Laravel's default broadcast channel — instead emit the
     * custom NotificationCreated event so the existing React `notificationStore`
     * + Echo wiring picks it up without changes.
     */
    public function broadcastOn(): array { return []; }
    public function shouldBroadcast(): bool { return false; }

    /** After DB write, fire NotificationCreated for realtime fanout. */
    public function withDelegate(): void
    {
        // Hook: Laravel doesn't call this; we manually broadcast in toBroadcast.
    }

    public function toBroadcast(object $notifiable): array
    {
        $unread = DB::table('notifications')
            ->where('notifiable_id', $notifiable->getKey())
            ->where('notifiable_type', get_class($notifiable))
            ->whereNull('read_at')->count();

        broadcast(new NotificationCreated(
            userId:      $notifiable->getKey(),
            payload:     $this->toArray($notifiable),
            unreadCount: $unread,
        ));
        return [];
    }
}
