<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\Contract;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class ContractCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Contract $contract) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim((string) config('app.url'), '/') . "/contracts/{$this->contract->id}";
        return (new MailMessage)
            ->subject("Your contract \"{$this->contract->title}\" is live")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your proposal was accepted. The contract is now active.")
            ->line("Title: {$this->contract->title}")
            ->line("Amount: \${$this->contract->amount}")
            ->action('View contract', $url)
            ->line('Once the client funds escrow, you can start work.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'contract',
            'title'       => 'Contract created',
            'body'        => "Contract \"{$this->contract->title}\" is now active.",
            'contract_id' => $this->contract->id,
            'action_url'  => "/contracts/{$this->contract->id}",
            'icon'        => 'briefcase',
        ];
    }

    public function broadcastOn(): array { return []; }
    public function shouldBroadcast(): bool { return false; }

    public function toBroadcast(object $notifiable): array
    {
        $unread = DB::table('notifications')
            ->where('notifiable_id', $notifiable->getKey())
            ->where('notifiable_type', get_class($notifiable))
            ->whereNull('read_at')->count();
        broadcast(new NotificationCreated($notifiable->getKey(), $this->toArray($notifiable), $unread));
        return [];
    }
}
