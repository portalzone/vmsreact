<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Vehicle;
use App\Models\Maintenance;
use App\Models\Expense;
use App\Models\Trip;
use Carbon\Carbon;
use PDF;
use App\Exports\EnhancedExpenseExport;
use App\Exports\EnhancedMaintenanceExport;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Generate vehicle report PDF
     */
    public function vehicleReportPdf($id)
    {
        $vehicle = Vehicle::with(['owner', 'driver.user', 'creator', 'editor'])
            ->findOrFail($id);

        $maintenances = Maintenance::where('vehicle_id', $id)
            ->with('createdBy')
            ->orderBy('date', 'desc')
            ->get();

        $expenses = Expense::where('vehicle_id', $id)
            ->orderBy('date', 'desc')
            ->get();

        $trips = Trip::where('vehicle_id', $id)
            ->with('driver')
            ->orderBy('start_time', 'desc')
            ->limit(20)
            ->get();

        $pdf = PDF::loadView('reports.vehicle', compact('vehicle', 'maintenances', 'expenses', 'trips'));
        
        return $pdf->download('vehicle-report-' . $vehicle->plate_number . '.pdf');
    }

    /**
     * Generate expense report PDF
     */
    public function expenseReportPdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $expenses = Expense::with(['vehicle', 'creator'])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        $totalAmount = $expenses->sum('amount');
        $byCategory = $expenses->groupBy('category')->map(function ($group) {
            return $group->sum('amount');
        });

        $pdf = PDF::loadView('reports.expenses', compact('expenses', 'startDate', 'endDate', 'totalAmount', 'byCategory'));
        
        return $pdf->download('expense-report-' . $startDate . '-to-' . $endDate . '.pdf');
    }

    /**
     * Generate maintenance report PDF
     */
    public function maintenanceReportPdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $maintenances = Maintenance::with(['vehicle', 'createdBy'])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        $totalCost = $maintenances->where('status', 'Completed')->sum('cost');
        $byStatus = $maintenances->groupBy('status')->map(function ($group) {
            return $group->count();
        });

        $pdf = PDF::loadView('reports.maintenance', compact('maintenances', 'startDate', 'endDate', 'totalCost', 'byStatus'));
        
        return $pdf->download('maintenance-report-' . $startDate . '-to-' . $endDate . '.pdf');
    }

    /**
     * Generate income report PDF
     */
    public function incomeReportPdf(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $startDate = $request->start_date;
        $endDate = $request->end_date;

        $incomes = \App\Models\Income::with(['vehicle', 'trip', 'driver.user'])
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->get();

        $totalAmount = $incomes->sum('amount');

        $pdf = PDF::loadView('reports.income', compact('incomes', 'startDate', 'endDate', 'totalAmount'));
        
        return $pdf->download('income-report-' . $startDate . '-to-' . $endDate . '.pdf');
    }

    /**
     * Export expenses to Excel
     */
    public function expenseExportExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        return Excel::download(
            new EnhancedExpenseExport($request->start_date, $request->end_date),
            'expense-report-' . $request->start_date . '-to-' . $request->end_date . '.xlsx'
        );
    }

    /**
     * Export maintenance to Excel
     */
    public function maintenanceExportExcel(Request $request)
    {
        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        return Excel::download(
            new EnhancedMaintenanceExport($request->start_date, $request->end_date),
            'maintenance-report-' . $request->start_date . '-to-' . $request->end_date . '.xlsx'
        );
    }
}