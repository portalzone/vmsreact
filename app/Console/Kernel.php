<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // ✅ YOUR CODE GOES HERE
        
        // Send maintenance reminders daily at 9 AM
        $schedule->command('maintenance:send-reminders')->dailyAt('09:00');
        
        // Send weekly summary every Monday at 8 AM
        $schedule->command('summary:send-weekly')->weeklyOn(1, '08:00');
        
        // Optional: Prune failed jobs or tokens (Standard Laravel maintenance)
        // $schedule->command('sanctum:prune-expired')->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        // This loads all commands found in the app/Console/Commands directory
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}