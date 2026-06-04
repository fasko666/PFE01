<?php

namespace App\Notifications;

use App\Events\NotificationCreated;
use App\Models\WeeklyInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\DB;

class WeeklyInvoicePaidNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public WeeklyInvoice $invoice, public bool $forFreelancer) {}

    public function via(object $notifiable): array { return ['mail', 'database', 'broadcast']; }

    public function toMail(object $notifiable): MailMessage
    {
        $amount  = $this->forFreelancer ? $this->invoice->net_to_freelancer : $this->invoice->gross_amount;
        $subject = $this->forFreelancer ? 'Weekly payment received' : 'Weekly billing charged';

        return (new MailMessage)
            ->subject($subject . ' — $' . number_format($amount, 2))
            ->greeting("Hi {$notifiable->name},")
            ->line($this->forFreelancer
                ? "You earned \${$this->invoice->net_to_freelancer} ({$this->invoice->hours_worked}h × \${$this->invoice->hourly_rate}/hr)"
                : "Your hourly contract was billed \${$this->invoice->gross_amount} for {$this->invoice->hours_worked} hours.")
            ->line("Week of {$this->invoice->week_start->toDateString()} – {$this->invoice->week_end->toDateString()}")
            ->action('Open dashboard', rtrim((string) config('app.url'), '/') . ($this->forFreelancer ? '/payments' : '/billing/contracts'));
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'        => 'payment',
            'title'       => $this->forFreelancer ? 'Weekly payment received' : 'Weekly billing charged',
            'body'        => $this->forFreelancer
                ? "+\${$this->invoice->net_to_freelancer} for {$this->invoice->hours_worked}h"
                : "Billed \${$this->invoice->gross_amount} for {$this->invoice->hours_worked}h",
            'invoice_id'  => $this->invoice->id,
            'action_url'  => $this->forFreelancer ? '/payments' : "/contracts/{$this->invoice->contract_id}",
            'icon'        => $this->forFreelancer ? 'dollar-sign' : 'receipt',
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
