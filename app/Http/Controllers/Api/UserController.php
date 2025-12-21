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
                $q->whereDoesntHave('roles')
                  ->orWhereHas('roles', function ($qr) use ($allowedRoles) {
                      $qr->whereIn('name', $allowedRoles);
                  });
            });

            if ($request->filled('role') && in_array($request->role, $allowedRoles)) {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        } else {
            if ($request->filled('role')) {
                $query->whereHas('roles', function ($q) use ($request) {
                    $q->where('name', $request->role);
                });
            }
        }

        $allowedSorts = ['name', 'email', 'created_at'];
        $sortBy = in_array($request->get('sort_by'), $allowedSorts) ? $request->get('sort_by') : 'created_at';
        $sortDir = $request->get('sort_dir') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDir);

        $perPage = in_array((int)$request->get('per_page'), [5, 10, 25, 50, 100]) ? (int)$request->get('per_page') : 10;

        return response()->json($query->paginate($perPage));
    }

    public function vehicleOwners()
    {
        $this->authorizeAccess('view');

        $owners = User::role('vehicle_owner')
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();

        return response()->json($owners);
    }

    public function store(Request $request)
    {
        $this->authorizeAccess('create');

        $validated = $request->validate([
            'name'     => 'required|string|max:100',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6',
            'role'     => 'required|string|exists:roles,name',
            'phone'    => 'nullable|string|max:20',
        ]);

        $authUser = auth()->user();
        
        if ($authUser->hasRole('gate_security') && $validated['role'] !== 'visitor') {
            return response()->json(['message' => 'Gate security can only create visitor users.'], 403);
        }
        
        if ($authUser->hasRole('manager')) {
            $allowedRoles = ['staff', 'visitor', 'driver', 'vehicle_owner', 'gate_security'];
            if (!in_array($validated['role'], $allowedRoles)) {
                return response()->json(['message' => 'Unauthorized role assignment.'], 403);
            }
        }

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone'    => $validated['phone'] ?? null,
        ]);

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

    public function show($id)
    {
        $this->authorizeAccess('view');
        $user = User::with('roles:id,name')->findOrFail($id);
        return response()->json($user);
    }

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

        $logs = Activity::where('log_name', 'user')
            ->where('causer_id', $user->id)
            ->orderByDesc('created_at')
            ->paginate(5);

        $transformed = $logs->getCollection()->map(function ($log) {
            return [
                'description' => $log->description,
                'changes' => $log->properties['attributes'] ?? [],
                'old' => $log->properties['old'] ?? [],
                'date' => $log->created_at->toDateTimeString(),
            ];
        });

        $logs->setCollection($transformed);

        return response()->json($logs);
    }

    public function destroy($id)
    {
        $this->authorizeAccess('delete');
        $user = User::findOrFail($id);
        
        // Delete avatar if exists
        if ($user->avatar) {
            $user->deleteImage($user->avatar);
        }
        
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function usersAvailableForDriverForm(Request $request)
    {
        $driverId = $request->query('driver_id');
        $assignedUserIds = Driver::pluck('user_id')->toArray();

        if ($driverId) {
            $currentDriver = Driver::find($driverId);
            if ($currentDriver) {
                $assignedUserIds = array_diff($assignedUserIds, [$currentDriver->user_id]);
            }
        }

        $users = User::whereNotIn('id', $assignedUserIds)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json($users);
    }

    public function availableForDrivers(Request $request)
    {
        $assignedUserIds = \App\Models\Driver::pluck('user_id')->toArray();

        if ($request->filled('driver_id')) {
            $currentUserId = \App\Models\Driver::where('id', $request->driver_id)->value('user_id');
            $assignedUserIds = array_diff($assignedUserIds, [$currentUserId]);
        }

        $users = \App\Models\User::role(['driver', 'visitor'])
            ->whereNotIn('id', $assignedUserIds)
            ->select('id', 'name', 'email')
            ->get();

        return response()->json($users);
    }

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

    public function me(Request $request)
    {
        return response()->json($request->user()->load('roles'));
    }

    public function profile(Request $request)
    {
        $user = Auth::user();
        return response()->json([
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'avatar' => $user->avatar,
            'avatar_url' => $user->avatar_url,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['nullable', 'string', 'max:20'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => $user->load('roles')
        ]);
    }

    /**
     * Upload avatar
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,gif,webp',
                'max:5120', // 5MB
            ],
        ]);

        try {
            $user = Auth::user();
            
            // Delete old avatar if exists
            if ($user->avatar) {
                $user->deleteImage($user->avatar);
            }
            
            // Upload new avatar
            $avatar = $user->uploadImage($request->file('image'), 'avatars');
            
            // Update user
            $user->update(['avatar' => $avatar]);
            
            return response()->json([
                'message' => 'Avatar uploaded successfully',
                'avatar' => $avatar,
                'avatar_url' => $user->getImageUrl($avatar),
                'user' => $user->load('roles')
            ]);
        } catch (\Exception $e) {
            \Log::error('Avatar upload failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to upload avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete avatar
     */
    public function deleteAvatar()
    {
        try {
            $user = Auth::user();
            
            if ($user->avatar) {
                $user->deleteImage($user->avatar);
                $user->update(['avatar' => null]);
            }
            
            return response()->json([
                'message' => 'Avatar deleted successfully',
                'user' => $user->load('roles')
            ]);
        } catch (\Exception $e) {
            \Log::error('Avatar deletion failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete avatar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Change password
     */
    public function changePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password is incorrect'
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['new_password'])
        ]);

        return response()->json([
            'message' => 'Password changed successfully'
        ]);
    }

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