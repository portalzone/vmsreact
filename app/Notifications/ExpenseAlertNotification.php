<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Expense;

class ExpenseAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $expense;
    protected $threshold;

    public function __construct(Expense $expense, $threshold)
    {
        $this->expense = $expense;
        $this->threshold = $threshold;
    }

    public function via($notifiable)
    {
        return ['mail', 'database'];
    }

    public function toMail($notifiable)
    {
        $vehicle = $this->expense->vehicle;
        
        return (new MailMessage)
            ->subject('⚠️ High Expense Alert - ' . $vehicle->plate_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('A high expense has been recorded.')
            ->line('Vehicle: ' . $vehicle->manufacturer . ' ' . $vehicle->model . ' (' . $vehicle->plate_number . ')')
            ->line('Amount: ₦' . number_format($this->expense->amount, 2))
            ->line('Category: ' . ucfirst($this->expense->category))
            ->line('Description: ' . $this->expense->description)
            ->line('Threshold: ₦' . number_format($this->threshold, 2))
            ->action('View Expense', url('/expenses/' . $this->expense->id))
            ->line('Please review this expense.');
    }

    public function toArray($notifiable)
    {
        return [
            'expense_id' => $this->expense->id,
            'vehicle_plate' => $this->expense->vehicle->plate_number,
            'amount' => $this->expense->amount,
            'category' => $this->expense->category,
            'threshold' => $this->threshold,
        ];
    }
}