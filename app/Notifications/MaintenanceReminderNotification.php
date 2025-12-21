<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Maintenance;

class MaintenanceReminderNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $maintenance;

    public function __construct(Maintenance $maintenance)
    {
        $this->maintenance = $maintenance;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $vehicle = $this->maintenance->vehicle;
        
        return (new MailMessage)
            ->subject('Maintenance Reminder - ' . $vehicle->plate_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('This is a reminder for upcoming maintenance.')
            ->line('Vehicle: ' . $vehicle->manufacturer . ' ' . $vehicle->model . ' (' . $vehicle->plate_number . ')')
            ->line('Description: ' . $this->maintenance->description)
            ->line('Scheduled Date: ' . $this->maintenance->date->format('M d, Y'))
            ->action('View Maintenance', url('/maintenance/' . $this->maintenance->id))
            ->line('Thank you for using our Vehicle Management System!');
    }

    public function toArray($notifiable)
    {
        return [
            'maintenance_id' => $this->maintenance->id,
            'vehicle_plate' => $this->maintenance->vehicle->plate_number,
            'description' => $this->maintenance->description,
            'date' => $this->maintenance->date,
        ];
    }
}