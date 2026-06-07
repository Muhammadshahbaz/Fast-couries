<?php

namespace App\Notifications;

use App\Models\PayoutInvoice;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PayoutInvoicePaid extends Notification
{
    use Queueable;

    public function __construct(private readonly PayoutInvoice $invoice)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Payout {$this->invoice->invoice_number} marked paid")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your payout invoice {$this->invoice->invoice_number} has been marked paid.")
            ->line('Net payable: Rs. '.number_format($this->invoice->net_payable_paisa / 100, 2))
            ->action('View payouts', route('payouts.index'));
    }
}
