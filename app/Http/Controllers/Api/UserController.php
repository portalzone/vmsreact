<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Pagination\LengthAwarePaginator;


class UserController extends Controller
{
// ✅ Get all users with roles

public function index(Request $request)
{
    $this->authorizeAccess('view');
    $user = auth()->user();
    $query = User::with('roles:id,name')->select('id', 'name', 'email');

    $allowedRoles = null;

    if ($user->hasRole('gate_security')) {
        $allowedRoles = ['visitor'];
        $query->whereHas('roles', function ($q) use ($allowedRoles) {
            $q->whereIn('name', $allowedRoles);
        });
    } elseif ($user->hasRole('manager')) {
        $allowedRoles = ['staff', 'visitor', 'driver', 'vehicle_owner', 'gate_security'];

        $query->where(function ($q) use ($allowedRoles) {
            // ✅ Include users without roles OR with allowed roles
            $q->whereDoesntHave('roles')
              ->orWhereHas('roles', function ($qr) use ($allowedRoles) {
                  $qr->whereIn('name', $allowedRoles);
              });
        });

        // Filter by role only if in allowed set
        if ($request->filled('role') && in_array($request->role, $allowedRoles)) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }
    } else {
        // Admin (or unrestricted roles)
        if ($request->filled('role')) {
            $query->whereHas('roles', function ($q) use ($request) {
                $q->where('name', $request->role);
            });
        }
        // ✅ Admins see everyone, including no-role users (no filter applied here)
    }

    // Sorting
    $allowedSorts = ['name', 'email', 'created_at'];
    $sortBy = in_array($request->get('sort_by'), $allowedSorts) ? $request->get('sort_by') : 'created_at';
    $sortDir = $request->get('sort_dir') === 'asc' ? 'asc' : 'desc';
    $query->orderBy($sortBy, $sortDir);

    // Pagination
    $perPage = in_array((int)$request->get('per_page'), [5, 10, 25, 50, 100]) ? (int)$request->get('per_page') : 10;

    return response()->json($query->paginate($perPage));
}


// public function index(Request $request)
// {
//     $this->authorizeAccess('view');
//     $user = auth()->user();
//     $query = User::with('roles:id,name')->select('id', 'name', 'email');

//     $allowedRoles = null;

//     if ($user->hasRole('gate_security')) {
//         $allowedRoles = ['visitor'];
//     } elseif ($user->hasRole('manager')) {
//         $allowedRoles = ['staff', 'visitor', 'driver', 'vehicle_owner', 'gate_security'];
//     }

//     if ($allowedRoles) {
//         $query->whereHas('roles', function ($q) use ($allowedRoles) {
//             $q->whereIn('name', $allowedRoles);
//         });

//         // 🟡 Only apply role filter if within allowed
//         if ($request->filled('role') && in_array($request->role, $allowedRoles)) {
//             $query->whereHas('roles', function ($q) use ($request) {
//                 $q->where('name', $request->role);
//             });
//         }
//     } else {
//         // Admin and others
//         if ($request->filled('role')) {
//             $query->whereHas('roles', function ($q) use ($request) {
//                 $q->where('name', $request->role);
//             });
//         }
//     }

//     // Sorting
//     $allowedSorts = ['name', 'email', 'created_at'];
//     $sortBy = in_array($request->get('sort_by'), $allowedSorts) ? $request->get('sort_by') : 'created_at';
//     $sortDir = $request->get('sort_dir') === 'asc' ? 'asc' : 'desc';
//     $query->orderBy($sortBy, $sortDir);

//     // Pagination
//     $perPage = in_array((int)$request->get('per_page'), [5, 10, 25, 50, 100]) ? (int)$request->get('per_page') : 10;

//     return response()->json($query->paginate($perPage));
// }



    // vehicle owner
// ✅ Return users with the 'vehicle_owner' role (for dropdowns, etc.)
public function vehicleOwners()
{
    $this->authorizeAccess('view', 'create', 'update'); // Optional: restrict to admins/managers

    $owners = User::role('vehicle_owner')
        ->select('id', 'name', 'email') // Add email if needed in frontend dropdowns
        ->orderBy('name')
        ->get();

    return response()->json($owners);
}


    // ✅ Create new user with role assignment (API guard)
    public function store(Request $request)
{
    $this->authorizeAccess('create');

    $validated = $request->validate([
        'name'     => 'required|string|max:100',
        'email'    => 'required|email|unique:users',
        'password' => 'required|string|min:6',
        'role'     => 'required|string|exists:roles,name', // ✅ Role must exist
        'phone'    => 'nullable|string|max:20', // Add phone
    ]);

    // ⛔ Restrict based on current user's role
    $authUser = auth()->user();
    
    // Gate security can ONLY create visitors
    if ($authUser->hasRole('gate_security') && $validated['role'] !== 'visitor') {
        return response()->json(['message' => 'Gate security can only create visitor users.'], 403);
    }
    
    // Manager restrictions
    if ($authUser->hasRole('manager')) {
        $allowedRoles = ['staff', 'visitor', 'driver', 'vehicle_owner', 'gate_security'];
        if (!in_array($validated['role'], $allowedRoles)) {
            return response()->json(['message' => 'Unauthorized role assignment.'], 403);
        }
    }

    // Create user
    $user = User::create([
        'name'     => $validated['name'],
        'email'    => $validated['email'],
        'password' => Hash::make($validated['password']),
        'phone'    => $validated['phone'] ?? null,
    ]);

    // Assign role with correct guard
    $role = Role::where('name', $validated['role'])->where('guard_name', 'api')->first();
    if (!$role) {
        return response()->json(['message' => 'Invalid role for API guard.'], 422);
    }

    $user->assignRole($role);

    return response()->json([
        'message' => 'User created successfully',
        'data'    => $user->load('roles:id,name'),
    ], 201);
}

    // ✅ Show user with roles
    public function show($id)
    {
        $this->authorizeAccess('view');
        $user = User::with('roles:id,name')->findOrFail($id);
        return response()->json($user);
    }

    // ✅ Update user and role (API guard)
    public function update(Request $request, $id)
{
    $this->authorizeAccess('update');

    try {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:100',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role'     => 'sometimes|string|exists:roles,name',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        // ⛔ Restrict role update based on current user
        if (!empty($validated['role'])) {
            $authUser = auth()->user();
            $restricted = [
                'gate_security' => ['staff', 'visitor'],
                'manager'       => ['staff', 'visitor', 'driver', 'vehicle_owner', 'gate_security'],
            ];

            foreach ($restricted as $roleName => $allowedRoles) {
                if ($authUser->hasRole($roleName) && !in_array($validated['role'], $allowedRoles)) {
                    return response()->json(['message' => 'Unauthorized role assignment.'], 403);
                }
            }

            $role = Role::where('name', $validated['role'])->where('guard_name', 'api')->first();
            if (!$role) {
                return response()->json(['message' => 'Invalid role for API guard.'], 422);
            }

            $user->syncRoles([$role]);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'data'    => $user->load('roles:id,name'),
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Failed to update user',
            'error'   => $e->getMessage(),
        ], 500);
    }
}


public function profileHistory()
{
    $user = Auth::user();

    // Get paginated activities
    $logs = Activity::where('log_name', 'user')
        ->where('causer_id', $user->id)
        ->orderByDesc('created_at')
        ->paginate(5); // paginate instead of take(20)

    // Map each activity item to a structured array
    $transformed = $logs->getCollection()->map(function ($log) {
        return [
            'description' => $log->description,
            'changes' => $log->properties['attributes'] ?? [],
            'old' => $log->properties['old'] ?? [],
            'date' => $log->created_at->toDateTimeString(),
        ];
    });

    // Replace the original collection with the transformed one
    $logs->setCollection($transformed);

    return response()->json($logs);
}



    // ✅ Delete a user
    public function destroy($id)
    {
        $this->authorizeAccess('delete');
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }


public function usersAvailableForDriverForm(Request $request)
{
    $driverId = $request->query('driver_id'); // e.g. ?driver_id=5
    $assignedUserIds = Driver::pluck('user_id')->toArray();

    if ($driverId) {
        $currentDriver = Driver::find($driverId);
        if ($currentDriver) {
            // Remove currently assigned user from the exclusion list
            $assignedUserIds = array_diff($assignedUserIds, [$currentDriver->user_id]);
        }
    }

    $users = User::whereNotIn('id', $assignedUserIds)
        ->select('id', 'name', 'email')
        ->get();

    return response()->json($users);
}
// user available for driver
public function availableForDrivers(Request $request)
{
    $assignedUserIds = \App\Models\Driver::pluck('user_id')->toArray();

    if ($request->filled('driver_id')) {
        // Get the currently assigned user_id for this driver
        $currentUserId = \App\Models\Driver::where('id', $request->driver_id)->value('user_id');

        // Allow this user_id in the results
        $assignedUserIds = array_diff($assignedUserIds, [$currentUserId]);
    }

$users = \App\Models\User::role(['driver', 'visitor'])
    ->whereNotIn('id', $assignedUserIds)
    ->select('id', 'name', 'email')
    ->get();

    return response()->json($users);
}


//user with driver status

public function usersWithDriverStatus()
{
    $assignedUserIds = Driver::pluck('user_id')->toArray();

    $users = User::select('id', 'name', 'email')
        ->get()
        ->map(function ($user) use ($assignedUserIds) {
            $user->already_assigned = in_array($user->id, $assignedUserIds);
            return $user;
        });

    return response()->json($users);
}

// Return authenticated user's profile
public function me(Request $request)
{
    return response()->json($request->user()->load('roles'));
}

 /**
     * Return the profile of the currently authenticated user.
     */
/**
     * Get the authenticated user's profile.
     */
    public function profile(Request $request)
    {
        $user = Auth::user();
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ]);
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'avatar' => ['nullable', 'image', 'max:2048'], // Max 2MB
        ]);

        $user->name = $validated['name'];
        $user->email = $validated['email'];
        $user->phone = $validated['phone'] ?? null;

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'avatar_url' => $user->avatar ? asset('storage/' . $user->avatar) : null,
        ]);
    }

    // 🔐 Role-based access checker
    private function authorizeAccess(string $action)
    {
        $user = auth()->user();

        if (!$user) {
            abort(403, 'User not authenticated.');
        }

        $map = [
            'view'   => ['admin', 'manager', 'gate_security'],
            'create' => ['admin', 'manager', 'gate_security'],
            'update' => ['admin', 'manager', 'gate_security'],
            'delete' => ['admin'],
        ];

        $allowedRoles = $map[$action] ?? [];

        if (!$user->hasAnyRole($allowedRoles)) {
             \Log::warning("Unauthorized {$action} attempt by user ID {$user?->id}");
            abort(403, 'Unauthorized for this action.');
        }
    }
}
