<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WeeklySummaryNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $data;

    public function __construct(array $data)
    {
        $this->data = $data;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('Weekly Summary Report')
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('Here is your weekly summary:')
            ->line('📊 **Statistics**')
            ->line('Trips Completed: ' . $this->data['trips_count'])
            ->line('Total Income: ₦' . number_format($this->data['total_income'], 2))
            ->line('Total Expenses: ₦' . number_format($this->data['total_expenses'], 2))
            ->line('Maintenance Records: ' . $this->data['maintenance_count'])
            ->line('Active Vehicles: ' . $this->data['active_vehicles'])
            ->action('View Dashboard', url('/dashboard'))
            ->line('Have a great week ahead!');
    }
}