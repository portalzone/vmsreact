<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Maintenance;
use App\Models\User; // ✅ Added: Required for the Notification logic
use Illuminate\Http\Request;
use App\Notifications\ExpenseAlertNotification;
use Illuminate\Support\Facades\Notification;

class ExpenseController extends Controller
{
    // 🔐 List expenses with role-based access
    public function index(Request $request)
    {
        $this->authorizeAccess('view');
        $user = auth()->user();

        if ($user->hasRole('admin') || $user->hasRole('manager')) {
            return Expense::with(['vehicle', 'maintenance', 'creator', 'updater'])->latest()->get();
        }

        if ($user->hasRole('vehicle_owner')) {
            return Expense::whereHas('vehicle', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            })->with(['vehicle', 'maintenance', 'creator', 'updater'])->latest()->get();
        }

        if ($user->hasRole('driver')) {
            return Expense::whereHas('vehicle.drivers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['vehicle', 'maintenance', 'creator', 'updater'])->latest()->get();
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    // ✅ Create a new expense
    public function store(Request $request)
    {
        $this->authorizeAccess('create');

        $validated = $request->validate([
            'vehicle_id'     => 'required|exists:vehicles,id',
            'maintenance_id' => 'nullable|exists:maintenances,id',
            'amount'         => 'required|numeric',
            'description'    => 'required|string',
            'date'           => 'required|date',
        ]);

        $validated['created_by'] = auth()->id();

        $expense = Expense::create($validated);

        // 🔔 Check if expense exceeds threshold
        $threshold = 50000; // ₦50,000
        if ($expense->amount > $threshold) {
            // Notify admins and managers
            $admins = User::role(['admin', 'manager'])->get();
            Notification::send($admins, new ExpenseAlertNotification($expense, $threshold));
        }

        // 🔁 Auto-complete maintenance if linked
        if (!empty($validated['maintenance_id'])) {
            Maintenance::where('id', $validated['maintenance_id'])
                ->update([
                    'status' => 'Completed',
                    'cost'   => $validated['amount'] ?? 0,
                ]);
        }

        // ✅ Harmonized Return: Includes Message AND Full Data
        return response()->json([
            'message' => 'Expense created successfully',
            'expense' => $expense->load(['vehicle', 'maintenance', 'creator', 'updater'])
        ], 201);
    }

    // ✅ View a single expense
    public function show($id)
    {
        $this->authorizeAccess('view');
        return Expense::with(['vehicle', 'maintenance', 'creator', 'updater'])->findOrFail($id);
    }

    // ✅ Update an expense
    public function update(Request $request, $id)
    {
        $this->authorizeAccess('update');

        $expense = Expense::findOrFail($id);

        $validated = $request->validate([
            'vehicle_id'     => 'sometimes|exists:vehicles,id',
            'maintenance_id' => 'nullable|exists:maintenances,id',
            'amount'         => 'sometimes|numeric',
            'description'    => 'sometimes|string',
            'date'           => 'sometimes|date',
        ]);

        $validated['updated_by'] = auth()->id();

        // 🔄 Handle maintenance ID update
        if (array_key_exists('maintenance_id', $validated)) {
            $oldMaintenanceId = $expense->maintenance_id;

            if ($oldMaintenanceId && $oldMaintenanceId !== $validated['maintenance_id']) {
                // Optional: Revert old maintenance status
                Maintenance::where('id', $oldMaintenanceId)
                    ->update(['status' => 'Pending']);
            }

            if (!empty($validated['maintenance_id'])) {
                // ✅ Set linked maintenance to Completed
                Maintenance::where('id', $validated['maintenance_id'])
                    ->update(['status' => 'Completed']);
            }
        }

        $expense->update($validated);

        // ✅ Update linked maintenance details (optional)
        if ($expense->maintenance_id) {
            $maintenanceUpdate = [];

            // If the amount or description or date changed, sync it to maintenance
            if (isset($validated['amount'])) {
                $maintenanceUpdate['cost'] = $validated['amount'];
            }
            if (isset($validated['description'])) {
                $maintenanceUpdate['description'] = $validated['description'];
            }
            if (isset($validated['date'])) {
                $maintenanceUpdate['updated_at'] = $validated['date'];
            }

            if (!empty($maintenanceUpdate)) {
                Maintenance::where('id', $expense->maintenance_id)
                    ->update($maintenanceUpdate);
            }
        }

        return response()->json(
            $expense->load(['vehicle', 'maintenance', 'creator', 'updater'])
        );
    }

    // ✅ Delete an expense
    public function destroy($id)
    {
        $this->authorizeAccess('delete');

        $expense = Expense::findOrFail($id);
        $expense->delete();

        return response()->json(['message' => 'Expense deleted']);
    }

    // 🔐 Centralized role authorization
    private function authorizeAccess(string $action)
    {
        $user = auth()->user();

        $permissions = [
            'view'   => ['admin', 'manager', 'vehicle_owner', 'driver'],
            'create' => ['admin', 'manager', 'driver'],
            'update' => ['admin', 'manager', 'driver'],
            'delete' => ['admin'],
        ];

        if (!$user || !$user->hasAnyRole($permissions[$action] ?? [])) {
            \Log::warning("Unauthorized {$action} attempt by user ID {$user?->id}");
            abort(403, 'Unauthorized for this action.');
        }
    }
}