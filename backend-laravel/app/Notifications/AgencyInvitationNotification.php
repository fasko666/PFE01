<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\AgencyInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class AgencyInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public AgencyInvitation $invitation) {}

    public function via(object $notifiable): array { return ['mail', 'database', 'broadcast']; }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim((string) config('app.url'), '/') . '/agency/invitations/' . $this->invitation->token;
        $agency = $this->invitation->agency;

        return (new MailMessage)
            ->subject("You've been invited to join {$agency?->name}")
            ->greeting("Hi,")
            ->line("{$this->invitation->inviter?->name} invited you to join the agency \"{$agency?->name}\" as a {$this->invitation->role}.")
            ->action('Accept invitation', $url)
            ->line('This invitation expires in 14 days.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'         => 'agency',
            'title'        => 'Agency invitation',
            'body'         => "You're invited to join {$this->invitation->agency?->name}",
            'invitation_id'=> $this->invitation->id,
            'action_url'   => '/agency/invitations/' . $this->invitation->token,
            'icon'         => 'users',
        ];
    }

    public function broadcastOn(): array  { return []; }
    public function shouldBroadcast(): bool { return false; }
    public function toBroadcast(object $notifiable): array
    {
        $unread = DB::table('notifications')->where('notifiable_id', $notifiable->getKey())
            ->where('notifiable_type', get_class($notifiable))->whereNull('read_at')->count();
        broadcast(new NotificationCreated($notifiable->getKey(), $this->toArray($notifiable), $unread));
        return [];
    }
}
