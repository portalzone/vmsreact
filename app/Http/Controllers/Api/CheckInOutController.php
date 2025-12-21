<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CheckInOut;
use App\Models\Driver;
use Illuminate\Http\Request;
use App\Events\VehicleCheckedIn;   // ✅ Added
use App\Events\VehicleCheckedOut;  // ✅ Added

class CheckInOutController extends Controller
{
    // ✅ List check-ins with pagination, search, vehicle + driver + user + checked_by
    public function index(Request $request)
    {
        $this->authorizeAccess('view');

        $search = $request->input('search');
        $perPage = $request->input('per_page', 10);

        $query = CheckInOut::with([
            'vehicle',
            'driver.user',
            'checkedInByUser',
            'checkedOutByUser',
        ])->latest();

        if ($search) {
            $query->whereHas('vehicle', function ($q) use ($search) {
                $q->where('plate_number', 'like', '%' . $search . '%');
            })->orWhereHas('driver.user', function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%');
            });
        }

        return response()->json($query->paginate($perPage));
    }

    // ✅ Get latest check-in for a specific vehicle
    public function latest(Request $request)
    {
        $vehicleId = $request->query('vehicle_id');

        if (!$vehicleId) {
            return response()->json(['message' => 'Vehicle ID is required'], 400);
        }

        $checkIn = CheckInOut::where('vehicle_id', $vehicleId)
            ->latest()
            ->first();

        if (!$checkIn) {
            return response()->json(['message' => 'No check-in found'], 404);
        }

        return response()->json($checkIn);
    }

    // ✅ Create a new check-in record (Check In Vehicle)
    public function store(Request $request)
    {
        $this->authorizeAccess('create');

        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
        ]);

        $driver = Driver::where('vehicle_id', $validated['vehicle_id'])->first();

        if (!$driver) {
            return response()->json(['message' => 'No driver is assigned to this vehicle.'], 422);
        }

        // Prevent duplicate check-in
        $alreadyCheckedIn = CheckInOut::where('vehicle_id', $validated['vehicle_id'])
            ->whereNull('checked_out_at')
            ->first();

        if ($alreadyCheckedIn) {
            return response()->json(['message' => 'This vehicle is already checked in.'], 422);
        }

        $validated['driver_id'] = $driver->id;
        $validated['checked_in_at'] = now();
        $validated['checked_in_by'] = auth()->id();

        $checkIn = CheckInOut::create($validated);

        // 📡 Broadcast real-time event
        broadcast(new VehicleCheckedIn($checkIn))->toOthers();

        return response()->json([
            'message' => 'Check-in successful.',
            'data' => $checkIn->load([
                'vehicle',
                'driver.user',
                'checkedInByUser',
                'checkedOutByUser',
            ]),
        ], 201);
    }

    // ✅ Custom check-out method (Check Out Vehicle)
    public function checkout($id)
    {
        $this->authorizeAccess('update');

        $checkIn = CheckInOut::whereNull('checked_out_at')->findOrFail($id);

        $checkIn->checked_out_at = now();
        $checkIn->checked_out_by = auth()->id();
        $checkIn->save();

        // 📡 Broadcast real-time event
        broadcast(new VehicleCheckedOut($checkIn))->toOthers();

        return response()->json([
            'message' => 'Check-out successful.',
            'data' => $checkIn->load([
                'vehicle',
                'driver.user',
                'checkedInByUser',
                'checkedOutByUser',
            ]),
        ]);
    }

    // ✅ Show a single record
    public function show($id)
    {
        $this->authorizeAccess('view');

        $record = CheckInOut::with([
            'vehicle',
            'driver.user',
            'checkedInByUser',
            'checkedOutByUser',
        ])->findOrFail($id);

        return response()->json($record);
    }

    // ✅ Update a record (Admin/Manager manual edit)
    public function update(Request $request, $id)
    {
        $this->authorizeAccess('update');

        $record = CheckInOut::findOrFail($id);

        $validated = $request->validate([
            'checked_out_at' => 'nullable|date',
        ]);

        $validated['checked_out_at'] = $validated['checked_out_at'] ?? now();
        $validated['checked_out_by'] = auth()->id();

        $record->update($validated);

        // Optional: Broadcast here if admin manually "checks out" via update
        if ($record->wasChanged('checked_out_at') && $record->checked_out_at) {
             broadcast(new VehicleCheckedOut($record))->toOthers();
        }

        return response()->json([
            'message' => 'Check-in/out record updated.',
            'data' => $record->load([
                'vehicle',
                'driver.user',
                'checkedInByUser',
                'checkedOutByUser',
            ]),
        ]);
    }

    // ✅ Delete a record
    public function destroy($id)
    {
        $this->authorizeAccess('delete');

        $record = CheckInOut::findOrFail($id);
        $record->delete();

        return response()->json(['message' => 'Check-in/out record deleted.']);
    }

    // 🔐 Role-based access
    private function authorizeAccess(string $action): void
    {
        $user = auth()->user();

        $roles = [
            'view'   => ['admin', 'manager', 'driver', 'gate_security'],
            'create' => ['admin', 'manager', 'gate_security'],
            'update' => ['admin', 'manager', 'gate_security'],
            'delete' => ['admin'],
        ];

        if (!$user || !$user->hasAnyRole($roles[$action] ?? [])) {
             \Log::warning("Unauthorized {$action} attempt by user ID {$user?->id}");
            abort(403, 'Unauthorized for this action.');
        }
    }
}