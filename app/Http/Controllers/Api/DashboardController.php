<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Income;
use App\Models\Expense;
use App\Models\Maintenance;
use App\Models\CheckInOut;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
public function stats()
{
    $today = Carbon::today();
    $thisMonth = Carbon::now()->startOfMonth();

    return response()->json([
        // Basic counts
        'vehicles' => Vehicle::count(),
        'drivers' => Driver::count(),
        'users' => \App\Models\User::count(),
        'trips' => Trip::count(),
        
        // Financial data
        'totalIncome' => Income::sum('amount'),
        'totalExpenses' => Expense::sum('amount'),
        'monthlyIncome' => Income::where('date', '>=', $thisMonth)->sum('amount'),
        'monthlyExpenses' => Expense::where('date', '>=', $thisMonth)->sum('amount'),
        
        // Maintenance counts
        'pendingMaintenance' => Maintenance::where('status', 'Pending')->count(),
        'inProgressMaintenance' => Maintenance::where('status', 'in_progress')->count(),
        'completedMaintenance' => Maintenance::where('status', 'Completed')->count(),
        'maintenance' => Maintenance::where('status', 'Pending')->count(), // Alias for compatibility
        
        // Trip stats
        'activeTrips' => Trip::where('status', 'in_progress')->count(),
        'completedTrips' => Trip::where('status', 'completed')->count(),
        'pendingTrips' => Trip::where('status', 'pending')->count(),
        
        // Check-in stats (FIXED COLUMN NAMES)
        'vehiclesInPremises' => CheckInOut::whereNull('checked_out_at')->count(),
        'todayCheckIns' => CheckInOut::whereDate('checked_in_at', $today)->count(),
        'todayCheckOuts' => CheckInOut::whereDate('checked_out_at', $today)->count(),
        'totalCheckIns' => CheckInOut::count(),
        'pendingCheckOuts' => CheckInOut::whereNull('checked_out_at')->count(),
        
        // Legacy names for backward compatibility
        'vehicles_inside' => CheckInOut::whereNull('checked_out_at')->count(),
        'check_ins_today' => CheckInOut::whereDate('checked_in_at', $today)->count(),
        'check_outs_today' => CheckInOut::whereDate('checked_out_at', $today)->count(),
    ]);
}
    public function recentActivity(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $page = $request->input('page', 1);
        $search = strtolower($request->input('search'));
        $type = $request->input('type');
        $from = $request->input('from');
        $to = $request->input('to');

        $checkInsOuts = CheckInOut::with(['vehicle', 'driver.user', 'checkedInBy', 'checkedOutBy'])
            ->get()
            ->flatMap(function ($c) {
                $activities = [];

                if ($c->checked_in_at) {
                    $activities[] = [
                        'type' => 'Check-In',
                        'message' => ($c->vehicle?->manufacturer ?? 'Unknown Manufacturer'). ' ' . ($c->vehicle?->model ?? 'Unknown Model'). ' with plate number (' . ($c->vehicle?->plate_number ?? 'Unknown Plate Number') .
                                     ') was checked in by ' .
                                     ($c->checkedInBy?->name ?? 'Unknown User'),
                        'time' => $c->checked_in_at,
                    ];
                }

                if ($c->checked_out_at) {
                    $activities[] = [
                        'type' => 'Check-Out',
                        'message' => ($c->vehicle?->plate_number ?? 'Unknown Vehicle') .
                                     ' checked out by ' .
                                     ($c->checkedOutBy?->name ?? 'Unknown User'),
                        'time' => $c->checked_out_at,
                    ];
                }

                return $activities;
            });

$maintenances = Maintenance::with(['vehicle', 'createdBy', 'updatedBy'])->get()->flatMap(function ($m) {
    $activities = [];

    $vehicle = $m->vehicle;
    $vehicleName = $vehicle ? "{$vehicle->manufacturer} {$vehicle->model} (Plate: {$vehicle->plate_number})" : "Unknown Vehicle";

    $creatorName = $m->createdBy?->name ?? 'Unknown User';
    $editorName = $m->updatedBy?->name ?? 'Unknown User';

    // Created entry
    $activities[] = [
        'type' => 'Maintenance Created',
        'message' => "{$vehicleName} maintenance created by {$creatorName}. Description: \"{$m->description}\", Cost: ₦" . number_format($m->cost, 2),
        'time' => $m->created_at,
    ];

    // Updated entry
    if ($m->updated_at != $m->created_at) {
        $activities[] = [
            'type' => 'Maintenance Updated',
            'message' => "{$vehicleName} maintenance updated by {$editorName}. Description: \"{$m->description}\", Cost: ₦" . number_format($m->cost, 2),
            'time' => $m->updated_at,
        ];
    }

    return $activities;
});


$vehicles = Vehicle::with(['driver.user', 'creator', 'editor'])->get()->flatMap(function ($v) {
    $activities = [];

    // Vehicle Registered Message
    $creatorName = $v->creator?->name ?? 'Unknown User';
    $driverName = $v->driver?->user?->name ?? null;

    $driverInfo = $driverName
        ? " It is currently assigned to driver {$driverName}."
        : " It is not yet assigned to any driver.";

    $activities[] = [
        'type' => 'Vehicle Registered',
        'message' => "Vehicle {$v->manufacturer} {$v->model} (Plate: {$v->plate_number}) was registered by {$creatorName} " . Carbon::parse($v->created_at)->diffForHumans() . "." . $driverInfo,
        'time' => $v->created_at,
    ];

    // Vehicle Updated Message (only if updated after creation)
    if ($v->updated_at != $v->created_at) {
        $editorName = $v->editor?->name ?? 'Unknown User';

        $activities[] = [
            'type' => 'Vehicle Updated',
            'message' => "Vehicle {$v->manufacturer} {$v->model} (Plate: {$v->plate_number}) was last edited by {$editorName} " . Carbon::parse($v->updated_at)->diffForHumans() . "." . $driverInfo,
            'time' => $v->updated_at,
        ];
    }

    return $activities;
});


$drivers = Driver::with(['user', 'vehicle', 'creator', 'editor'])->get()->flatMap(function ($d) {
    $activities = [];

    $driverName = $d->user?->name ?? 'Unknown Driver';
    $creatorName = $d->creator?->name ?? 'Unknown User';
    $vehicleInfo = $d->vehicle
        ? " and was assigned to vehicle {$d->vehicle->manufacturer} {$d->vehicle->model} with plate number {$d->vehicle->plate_number}."
        : ".";

    // Driver Registered Message
    $activities[] = [
        'type' => 'Driver Registered',
        'message' => "Driver {$driverName} was registered by {$creatorName} " . Carbon::parse($d->created_at)->diffForHumans() . $vehicleInfo,
        'time' => $d->created_at,
    ];

    // Driver Updated Message (if updated)
    if ($d->updated_at != $d->created_at) {
        $editorName = $d->editor?->name ?? 'Unknown User';

        $activities[] = [
            'type' => 'Driver Updated',
            'message' => "Driver {$driverName} was last edited by {$editorName} " . Carbon::parse($d->updated_at)->diffForHumans() . $vehicleInfo,
            'time' => $d->updated_at,
        ];
    }

    return $activities;
});

$incomes = \App\Models\Income::with(['trip', 'vehicle', 'driver.user'])->get()->flatMap(function ($income) {
    $activities = [];

    $vehicle = $income->vehicle;
    $trip = $income->trip;
    $driver = $income->driver?->user?->name ?? 'Unknown Driver';

    $vehicleInfo = $vehicle
        ? "{$vehicle->manufacturer} {$vehicle->model} (Plate: {$vehicle->plate_number})"
        : "Unknown Vehicle";

    $tripInfo = $trip
        ? "Trip from {$trip->start_location} to {$trip->end_location}"
        : "Unknown Trip";

    $description = $income->description ?? 'No description';

    $activities[] = [
        'type' => 'Income Created',
        'message' => "₦" . number_format($income->amount, 2) .
                     " income recorded for {$vehicleInfo}, driven by {$driver}. " .
                     "{$tripInfo}. Description: \"{$description}\".",
        'time' => $income->created_at,
    ];

    if ($income->updated_at != $income->created_at) {
        $activities[] = [
            'type' => 'Income Updated',
            'message' => "Income of ₦" . number_format($income->amount, 2) .
                         " was updated for {$vehicleInfo}, trip: {$tripInfo}. Description: \"{$description}\".",
            'time' => $income->updated_at,
        ];
    }

    return $activities;
});




$expenses = Expense::with(['vehicle', 'maintenance', 'creator', 'updater'])->get()->flatMap(function ($e) {
    $activities = [];

    $vehicle = $e->vehicle;
    $maintenance = $e->maintenance;

    $vehicleName = $vehicle ? "{$vehicle->manufacturer} {$vehicle->model} (Plate: {$vehicle->plate_number})" : "Unknown Vehicle";
    $maintenanceNote = $maintenance ? "Linked to maintenance: \"{$maintenance->description}\" (₦" . number_format($maintenance->cost, 2) . ")." : "Standalone expense.";

    $creatorName = $e->creator?->name ?? 'Unknown User';
    $updaterName = $e->updater?->name ?? 'Unknown User';

    // Created
    $activities[] = [
        'type' => 'Expense Created',
        'message' => "₦" . number_format($e->amount, 2) . " — {$e->description} for {$vehicleName}. {$maintenanceNote} Created by {$creatorName}.",
        'time' => $e->created_at,
        'link' => $maintenance ? "/maintenances/{$maintenance->id}" : null,
    ];

    // Updated
    if ($e->updated_at != $e->created_at) {
        $activities[] = [
            'type' => 'Expense Updated',
            'message' => "₦" . number_format($e->amount, 2) . " — {$e->description} for {$vehicleName}. {$maintenanceNote} Updated by {$updaterName}.",
            'time' => $e->updated_at,
            'link' => $maintenance ? "/maintenances/{$maintenance->id}" : null,
        ];
    }

    return $activities;
});




$trips = Trip::with(['vehicle', 'driver.user'])->get()->map(function ($t) {
    $startTime = Carbon::parse($t->start_time);
    $endTime = Carbon::parse($t->end_time);

    // Calculate duration
    $duration = $startTime->diff($endTime);
    $durationString = $duration->format('%h hour(s) %i minute(s)');

    return [
        'type' => 'Trip',
        'message' => 'Trip from ' . $t->start_location . ' to ' . $t->end_location .
                     ' by ' . ($t->driver?->user?->name ?? 'Unknown Driver') .
                     ' using ' . ($t->vehicle?->manufacturer ?? 'Unknown Manufacturer') . ' ' .
                     ($t->vehicle?->model ?? 'Unknown Model') .
                     ' (' . ($t->vehicle?->plate_number ?? 'Unknown Plate Number') . ') ' .
                     'started at ' . $startTime->format('M j, Y g:i A') .
                     ' and ended at ' . $endTime->format('M j, Y g:i A') .
                     ', duration: ' . $durationString,
        'time' => $t->created_at,
    ];
});

        $all = collect()
            ->merge($checkInsOuts)
            ->merge($maintenances)
            ->merge($vehicles)
            ->merge($drivers)
            ->merge($expenses)
            ->merge($trips)
            ->merge($incomes)
            ->when($type, fn($items) => $items->filter(fn($item) => $item['type'] === $type))
            ->when($search, fn($items) => $items->filter(fn($item) =>
                str_contains(strtolower($item['message']), $search)
            ))
            ->when($from, fn($items) => $items->filter(fn($item) =>
                \Carbon\Carbon::parse($item['time'])->gte($from)
            ))
            ->when($to, fn($items) => $items->filter(fn($item) =>
                \Carbon\Carbon::parse($item['time'])->lte($to)
            ))
            ->sortByDesc('time')
            ->values();

        $total = $all->count();
        $paginated = $all->slice(($page - 1) * $perPage, $perPage)->values();

        return response()->json([
            'data' => $paginated,
            'total' => $total,
            'current]_page' => (int)$page,
            'per_page' => (int)$perPage,
            'last_page' => ceil($total / $perPage),
        ]);
    }

    public function monthlyTrends()
    {
        $months = collect(range(0, 11))->map(function ($i) {
            return now()->subMonths($i)->format('M Y');
        })->reverse()->values();

        $data = [];

        foreach ($months as $monthLabel) {
            $month = Carbon::createFromFormat('M Y', $monthLabel);

            $vehicles = DB::table('vehicles')->whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->count();
            $drivers = DB::table('drivers')->whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->count();
                        $expenses = DB::table('expenses')->whereMonth('date', $month->month)->whereYear('date', $month->year)->sum('amount');
            $maintenances = DB::table('maintenances')->whereMonth('date', $month->month)->whereYear('date', $month->year)->sum('cost');
            $incomes = DB::table('incomes')->whereMonth('date', $month->month)->whereYear('date', $month->year)->sum('amount');
            $expenses = DB::table('expenses')->whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->sum('amount');
            // $maintenances = DB::table('maintenances')->whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->sum('cost');
            $trips = DB::table('trips')->whereMonth('created_at', $month->month)->whereYear('created_at', $month->year)->count();

            $data[] = [
                'month' => $monthLabel,
                'vehicles' => $vehicles,
                'drivers' => $drivers,
                'expenses' => (float) $expenses,
                'incomes' => (float) $incomes,
                'maintenances' => (float) $maintenances,
                'trips' => $trips,
            ];
        }

        return response()->json($data);
    }
}
