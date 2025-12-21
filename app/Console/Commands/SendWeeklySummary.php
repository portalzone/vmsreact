<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Trip;
use App\Models\Expense;
use App\Models\Maintenance;
use App\Models\Vehicle;
use App\Notifications\WeeklySummaryNotification;
use Carbon\Carbon;

class SendWeeklySummary extends Command
{
    protected $signature = 'summary:send-weekly';
    protected $description = 'Send weekly summary to admins and managers';

    public function handle()
    {
        $startOfWeek = Carbon::now()->startOfWeek();
        $endOfWeek = Carbon::now()->endOfWeek();

        $data = [
            'trips_count' => Trip::whereBetween('start_time', [$startOfWeek, $endOfWeek])->count(),
            'total_income' => Trip::whereBetween('start_time', [$startOfWeek, $endOfWeek])->sum('amount'),
            'total_expenses' => Expense::whereBetween('date', [$startOfWeek, $endOfWeek])->sum('amount'),
            'maintenance_count' => Maintenance::whereBetween('date', [$startOfWeek, $endOfWeek])->count(),
            'active_vehicles' => Vehicle::where('status', 'active')->count(),
        ];

        $admins = User::role(['admin', 'manager'])->get();
        
        foreach ($admins as $admin) {
            $admin->notify(new WeeklySummaryNotification($data));
        }

        $this->info('Weekly summary sent successfully!');
    }
}