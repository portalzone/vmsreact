<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // ✅ Register a new user
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']), // ✅ Changed bcrypt to Hash::make
        ]);

        // Optional: assign default role
        // $user->assignRole('visitor');

        $token = $user->createToken('api-token')->plainTextToken;
        
        // Load roles
        $user->load('roles');
        $role = $user->getRoleNames()->first(); // returns single role as string

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id', 'name', 'email']) + [
                'role' => $role,
                'roles' => $user->roles
            ],
        ], 201);
    }

    // ✅ Login with tracking
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // ✅ Track login (increment count and update timestamp)
        $user->increment('login_count');
        $user->last_login_at = now();
        $user->save();

        // Load roles relationship for the roles array
        $user->load('roles');
        
        $token = $user->createToken('api-token')->plainTextToken;
        $role = $user->getRoleNames()->first(); // Keep this for backwards compatibility

        return response()->json([
            'token' => $token,
            'user'  => $user->only(['id', 'name', 'email']) + [
                'role' => $role,           // Old format (string) - for compatibility
                'roles' => $user->roles    // New format (array) - for ProtectedRoute
            ],
        ]);
    }

    // ✅ Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    // 🔒 Get authenticated user
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load('roles');
        
        $role = $user->getRoleNames()->first();

        return response()->json([
            'user' => $user->only(['id', 'name', 'email']) + [
                'role' => $role,
                'roles' => $user->roles
            ],
        ]);
    }

    // ✅ Admin-only access control
    private function authorizeAccess(string $action)
    {
        $user = auth()->user();

        $map = [
            'view'   => ['admin'],
            'create' => ['admin'],
            'update' => ['admin'],
            'delete' => ['admin'],
        ];

        $allowedRoles = $map[$action] ?? [];

        if (!$user || !$user->hasAnyRole($allowedRoles)) {
            \Log::warning("Unauthorized {$action} attempt by user ID {$user?->id}");
            abort(403, 'Unauthorized for this action.');
        }
    }
}