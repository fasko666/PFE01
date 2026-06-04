<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class PaymentReleasedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Transaction $transaction) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Payment received — \${$this->transaction->amount}")
            ->greeting("Hi {$notifiable->name},")
            ->line("\${$this->transaction->amount} was added to your wallet.")
            ->line("Reference: {$this->transaction->reference}")
            ->action('Open wallet', rtrim((string) config('app.url'), '/') . '/payments');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'           => 'payment',
            'title'          => 'Payment received',
            'body'           => "\${$this->transaction->amount} added to your wallet.",
            'transaction_id' => $this->transaction->id,
            'action_url'     => '/payments',
            'icon'           => 'dollar-sign',
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
