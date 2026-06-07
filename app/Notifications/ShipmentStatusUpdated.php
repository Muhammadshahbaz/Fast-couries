<?php

namespace App\Notifications;

use App\Models\Shipment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ShipmentStatusUpdated extends Notification
{
    use Queueable;

    public function __construct(private readonly Shipment $shipment)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Shipment {$this->shipment->tracking_number} is now {$this->shipment->status}")
            ->greeting("Hello {$notifiable->name},")
            ->line("Your shipment {$this->shipment->tracking_number} status is now ".str_replace('_', ' ', $this->shipment->status).'.')
            ->action('View shipment', route('shipments.show', $this->shipment))
            ->line('Thank you for shipping with Fast Couriers.');
    }
}
