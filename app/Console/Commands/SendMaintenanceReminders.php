<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Maintenance;
use App\Models\User;
use App\Notifications\MaintenanceReminderNotification;
use Carbon\Carbon;

class SendMaintenanceReminders extends Command
{
    protected $signature = 'maintenance:send-reminders';
    protected $description = 'Send maintenance reminders for upcoming maintenance';

    public function handle()
    {
        // Get maintenance scheduled for next 3 days
        $upcomingMaintenance = Maintenance::with(['vehicle.owner'])
            ->where('status', 'Pending')
            ->whereBetween('date', [Carbon::today(), Carbon::today()->addDays(3)])
            ->get();

        foreach ($upcomingMaintenance as $maintenance) {
            // Notify admins, managers, and vehicle owner
            $notifiables = User::role(['admin', 'manager'])->get();
            
            if ($maintenance->vehicle && $maintenance->vehicle->owner) {
                $notifiables->push($maintenance->vehicle->owner);
            }
            
            foreach ($notifiables as $user) {
                $user->notify(new MaintenanceReminderNotification($maintenance));
            }
        }

        $this->info('Maintenance reminders sent successfully!');
    }
}