<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Trip;

class TripCompletedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $trip;

    public function __construct(Trip $trip)
    {
        $this->trip = $trip;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $vehicle = $this->trip->vehicle;
        $driver = $this->trip->driver;
        
        return (new MailMessage)
            ->subject('Trip Completed - ' . $vehicle->plate_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A trip has been completed.')
            ->line('Vehicle: ' . $vehicle->manufacturer . ' ' . $vehicle->model . ' (' . $vehicle->plate_number . ')')
            ->line('Driver: ' . $driver->user->name)
            ->line('Route: ' . $this->trip->start_location . ' → ' . $this->trip->end_location)
            ->line('Duration: ' . $this->calculateDuration())
            ->line('Amount: ₦' . number_format($this->trip->amount, 2))
            ->action('View Trip', url('/trips/' . $this->trip->id))
            ->line('Thank you!');
    }

    public function toArray($notifiable)
    {
        return [
            'trip_id' => $this->trip->id,
            'vehicle_plate' => $this->trip->vehicle->plate_number,
            'driver_name' => $this->trip->driver->user->name,
            'route' => $this->trip->start_location . ' → ' . $this->trip->end_location,
            'amount' => $this->trip->amount,
        ];
    }

    private function calculateDuration()
    {
        if (!$this->trip->end_time) return 'In Progress';
        
        $start = new \DateTime($this->trip->start_time);
        $end = new \DateTime($this->trip->end_time);
        $diff = $start->diff($end);
        
        return $diff->h . 'h ' . $diff->i . 'm';
    }
}