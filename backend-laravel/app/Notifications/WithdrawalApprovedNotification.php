<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\Withdrawal;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class WithdrawalApprovedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Withdrawal $withdrawal) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isStripe = $this->withdrawal->method === 'stripe';
        return (new MailMessage)
            ->subject("Withdrawal approved — \${$this->withdrawal->net}")
            ->greeting("Hi {$notifiable->name},")
            ->line("Your withdrawal of \${$this->withdrawal->net} (after a \${$this->withdrawal->fee} fee) was approved.")
            ->line($isStripe
                ? 'Stripe is processing the payout — funds typically arrive in 1–3 business days.'
                : 'Funds will be sent via your chosen method within the timeframe disclosed at request time.')
            ->action('View withdrawals', rtrim((string) config('app.url'), '/') . '/payments/withdraw');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'          => 'payment',
            'title'         => 'Withdrawal approved',
            'body'          => "\${$this->withdrawal->net} approved for payout via {$this->withdrawal->method}.",
            'withdrawal_id' => $this->withdrawal->id,
            'action_url'    => '/payments/withdraw',
            'icon'          => 'banknote',
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
