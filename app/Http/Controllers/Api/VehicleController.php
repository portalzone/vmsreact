<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Models\CheckInOut;
use Illuminate\Http\Request;
use App\Models\Driver;
use Illuminate\Support\Facades\Auth;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $this->authorizeAccess('view');

        $query = Vehicle::with(['owner', 'creator', 'driver.user']);

        // 🔍 Search by ID, manufacturer, model, or plate_number
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('id', $search)
                  ->orWhere('manufacturer', 'like', "%{$search}%")
                  ->orWhere('model', 'like', "%{$search}%")
                  ->orWhere('plate_number', 'like', "%{$search}%");
            });
        }

        // 🧩 Filter by ownership_type
        if ($ownershipType = $request->input('ownership_type')) {
            $query->where('ownership_type', $ownershipType);

            // If ownership_type is 'individual', filter by individual_type
            if ($ownershipType === 'individual') {
                if ($individualType = $request->input('individual_type')) {
                    $query->where('individual_type', $individualType);
                }
            }
        }

        // 🧑‍✈️ Filter by driver_id
        if ($driverId = $request->input('driver_id')) {
            $query->whereHas('driver', function ($q) use ($driverId) {
                $q->where('id', $driverId);
            });
        }

        // 📌 Role-based restrictions
        $user = auth()->user();
        if ($user->hasRole('driver')) {
            $query->whereHas('driver', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } elseif ($user->hasRole('vehicle_owner')) {
            $query->where('owner_id', $user->id);
        } elseif ($user->hasRole('gate_security')) {
            // Gate security can only see visitor vehicles
            $query->where('ownership_type', 'individual')
                  ->where('individual_type', 'visitor');
        }
        // Admin & Manager see all

        // 🔁 Sorting
        $sortBy = $request->input('sort_by', 'id');
        $sortOrder = $request->input('order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        return response()->json(
            $query->paginate($request->input('per_page', 15))
        );
    }

    public function vehiclesWithinPremises()
    {
        $vehicles = CheckInOut::with([
                'vehicle:id,manufacturer,model,plate_number',
                'driver.user:id,name'
            ])
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->orderBy('checked_in_at', 'desc')
            ->get();

        return response()->json($vehicles);
    }

    public function assignedVehicles()
    {
        $vehicles = Driver::with('vehicle')
            ->whereNotNull('vehicle_id')
            ->get()
            ->pluck('vehicle')
            ->filter()
            ->values();

        return response()->json($vehicles);
    }

    public function vehiclesWithDrivers()
    {
        $this->authorizeAccess('view');

        return Vehicle::whereHas('driver')->with('driver')->get();
    }

    public function withDrivers()
    {
        $this->authorizeAccess('view');

        $vehicles = Vehicle::with(['driver.user'])
            ->whereHas('driver')
            ->get();

        return response()->json($vehicles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'manufacturer'     => 'required|string|max:255',
            'model'            => 'required|string|max:255',
            'year'             => 'required|integer|min:1900|max:' . date('Y'),
            'plate_number'     => 'required|string|max:50|unique:vehicles',
            'ownership_type'   => 'required|in:organization,individual',
            'individual_type'  => 'nullable|in:staff,visitor,vehicle_owner',
            'owner_id'         => 'nullable|exists:users,id',
            // New fields
            'color'            => 'nullable|string|max:50',
            'vin'              => 'nullable|string|max:17|unique:vehicles',
            'status'           => 'nullable|in:active,maintenance,inactive,sold',
            'fuel_type'        => 'nullable|in:petrol,diesel,electric,hybrid,cng,lpg',
            'seating_capacity' => 'nullable|integer|min:1|max:100',
            'mileage'          => 'nullable|numeric|min:0',
            'purchase_date'    => 'nullable|date',
            'purchase_price'   => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
        ]);

        if ($validated['ownership_type'] === 'individual') {
            if (!isset($validated['individual_type'])) {
                return response()->json(['error' => 'Individual type is required for individual ownership'], 422);
            }

            if ($validated['individual_type'] === 'vehicle_owner' && !$request->filled('owner_id')) {
                return response()->json(['error' => 'Owner ID is required when individual type is vehicle_owner'], 422);
            }

            if ($validated['individual_type'] !== 'vehicle_owner') {
                $validated['owner_id'] = null; // Clear owner_id if not vehicle_owner
            }
        } else {
            $validated['individual_type'] = null;
            $validated['owner_id'] = null;
        }

        $validated['created_by'] = Auth::id();

        $vehicle = Vehicle::create($validated);

        return response()->json(['message' => 'Vehicle created successfully', 'vehicle' => $vehicle]);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'manufacturer'     => 'required|string|max:255',
            'model'            => 'required|string|max:255',
            'year'             => 'required|integer|min:1900|max:' . date('Y'),
            'plate_number'     => 'required|string|max:50|unique:vehicles,plate_number,' . $vehicle->id,
            'ownership_type'   => 'required|in:organization,individual',
            'individual_type'  => 'nullable|in:staff,visitor,vehicle_owner',
            'owner_id'         => 'nullable|exists:users,id',
            // New fields
            'color'            => 'nullable|string|max:50',
            'vin'              => 'nullable|string|max:17|unique:vehicles,vin,' . $vehicle->id,
            'status'           => 'nullable|in:active,maintenance,inactive,sold',
            'fuel_type'        => 'nullable|in:petrol,diesel,electric,hybrid,cng,lpg',
            'seating_capacity' => 'nullable|integer|min:1|max:100',
            'mileage'          => 'nullable|numeric|min:0',
            'purchase_date'    => 'nullable|date',
            'purchase_price'   => 'nullable|numeric|min:0',
            'notes'            => 'nullable|string',
        ]); // ✅ Fixed: Added missing closing bracket

        if ($validated['ownership_type'] === 'individual') {
            if (!isset($validated['individual_type'])) {
                return response()->json(['error' => 'Individual type is required for individual ownership'], 422);
            }

            if ($validated['individual_type'] === 'vehicle_owner' && !$request->filled('owner_id')) {
                return response()->json(['error' => 'Owner ID is required when individual type is vehicle_owner'], 422);
            }

            if ($validated['individual_type'] !== 'vehicle_owner') {
                $validated['owner_id'] = null;
            }
        } else {
            $validated['individual_type'] = null;
            $validated['owner_id'] = null;
        }

        $validated['updated_by'] = Auth::id();

        $vehicle->update($validated);

        return response()->json(['message' => 'Vehicle updated successfully', 'vehicle' => $vehicle]);
    }

    public function myVehicles()
    {
        $user = auth()->user();

        if (!$user || !$user->hasRole('vehicle_owner')) {
            return response()->json(['error' => 'Only vehicle owners can access this.'], 403);
        }

        $vehicles = Vehicle::with(['driver', 'creator', 'editor', 'owner'])
            ->where('owner_id', $user->id)
            ->where('ownership_type', 'individual')
            ->latest()
            ->get();

        return response()->json($vehicles);
    }

    public function show($id)
    {
        $this->authorizeAccess('view');

        return Vehicle::with(['driver', 'creator', 'editor', 'owner'])->findOrFail($id);
    }

    public function availableForDrivers(Request $request)
    {
        $assignedVehicleIds = Driver::pluck('vehicle_id')->toArray();

        if ($request->filled('driver_id')) {
            $currentVehicleId = Driver::where('id', $request->driver_id)->value('vehicle_id');
            $assignedVehicleIds = array_diff($assignedVehicleIds, [$currentVehicleId]);
        }

        $vehicles = Vehicle::whereNotIn('id', $assignedVehicleIds)
            ->select('id', 'plate_number', 'model', 'manufacturer')
            ->get();

        return response()->json($vehicles);
    }

    public function searchByPlate(Request $request)
    {
        $this->authorizeAccess('view');

        $query = $request->get('q');

        if (!$query) {
            return response()->json([]);
        }

        $vehicles = Vehicle::where('plate_number', 'like', '%' . $query . '%')
            ->whereHas('driver')
            ->with(['driver.user'])
            ->limit(10)
            ->get();

        return response()->json($vehicles);
    }

    public function destroy($id)
    {
        $this->authorizeAccess('delete');

        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return response()->json(['message' => 'Vehicle deleted']);
    }

    private function authorizeAccess(string $action): void
    {
        $user = auth()->user();

        $rolePermissions = [
            'view'   => ['admin', 'manager', 'vehicle_owner', 'gate_security', 'driver'],
            'create' => ['admin', 'manager', 'vehicle_owner', 'gate_security'],
            'update' => ['admin', 'manager', 'vehicle_owner'],
            'delete' => ['admin'],
        ];

        $allowedRoles = $rolePermissions[$action] ?? [];

        if (!$user || !$user->hasAnyRole($allowedRoles)) {
            \Log::warning("Unauthorized {$action} attempt by user ID {$user?->id}");
            abort(403, 'Unauthorized for this action.');
        }
    }
}