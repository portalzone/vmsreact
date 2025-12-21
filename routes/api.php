<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\CheckInOutController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\TripController;
use App\Http\Controllers\Api\AuditTrailController;
use App\Http\Controllers\Api\GateSecurityController;
use App\Http\Controllers\Api\IncomeController;
use Illuminate\Support\Facades\Password;
use App\Http\Controllers\Api\ReportController;

// 🔓 Public Routes (No Auth Required)
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Password Reset Routes
Route::post('/forgot-password', function (Request $request) {
    $request->validate(['email' => 'required|email']);

    $status = Password::sendResetLink(
        $request->only('email')
    );

    if ($status === Password::RESET_LINK_SENT) {
        return response()->json([
            'message' => 'Password reset link sent to your email'
        ]);
    }

    return response()->json([
        'message' => 'Unable to send reset link. Please check your email address.'
    ], 400);
});

Route::post('/reset-password', function (Request $request) {
    $request->validate([
        'token' => 'required',
        'email' => 'required|email',
        'password' => 'required|min:8|confirmed',
    ]);

    $status = Password::reset(
        $request->only('email', 'password', 'password_confirmation', 'token'),
        function ($user, $password) {
            $user->forceFill([
                'password' => Hash::make($password)
            ])->save();
        }
    );

    if ($status === Password::PASSWORD_RESET) {
        return response()->json([
            'message' => 'Password has been reset successfully'
        ]);
    }

    return response()->json([
        'message' => 'Failed to reset password. Invalid or expired token.'
    ], 400);
});

// 🔒 Authenticated Routes (Token Required via Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // ✅ Auth & Profile
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/user', fn(Request $request) => $request->user());
    Route::post('/logout', [AuthController::class, 'logout']);

    // 🔔 Notifications
    Route::get('/notifications', function () {
        return auth()->user()->notifications()->latest()->get();
    });
    
    Route::post('/notifications/{id}/read', function ($id) {
        auth()->user()->notifications()->where('id', $id)->update(['read_at' => now()]);
        return response()->json(['message' => 'Notification marked as read']);
    });
    
    Route::post('/notifications/mark-all-read', function () {
        auth()->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All notifications marked as read']);
    });

    // ✅ Roles
    Route::get('/roles', [RoleController::class, 'index']);

    // 📊 Reports - PDF & Excel Generation
    Route::prefix('reports')->group(function () {
        // PDF Reports
        Route::get('/vehicle/{id}/pdf', [ReportController::class, 'vehicleReportPdf']);
        Route::post('/expenses/pdf', [ReportController::class, 'expenseReportPdf']);
        Route::post('/maintenance/pdf', [ReportController::class, 'maintenanceReportPdf']);
        Route::post('/income/pdf', [ReportController::class, 'incomeReportPdf']);
        
        // Excel Exports
        Route::post('/expenses/excel', [ReportController::class, 'expenseExportExcel']);
        Route::post('/maintenance/excel', [ReportController::class, 'maintenanceExportExcel']);
    });

    // ✅ Users
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::get('/available-users', [UserController::class, 'availableForDrivers']);
    Route::get('/users-with-driver-status', [UserController::class, 'usersWithDriverStatus']);
    Route::get('/users-available-for-drivers', [UserController::class, 'availableForDrivers']);
    Route::get('/vehicle-owners', [UserController::class, 'vehicleOwners']);
    Route::apiResource('users', UserController::class)->except(['show']);

    // ✅ Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/monthly-trends', [DashboardController::class, 'monthlyTrends']);
    Route::get('/dashboard/recent', [DashboardController::class, 'recentActivity']);

    // ✅ Gate security
    Route::get('/gate-security/stats', [GateSecurityController::class, 'stats']);
    Route::get('/gate-security/recent-logs', [GateSecurityController::class, 'recentLogs']);
    Route::get('/gate-security/alerts', [GateSecurityController::class, 'alerts']);

    // ✅ Vehicles
    Route::get('/vehicles/with-drivers', [VehicleController::class, 'withDrivers']);
    Route::get('/vehicles-available-for-drivers', [VehicleController::class, 'availableForDrivers']);
    Route::get('/assigned-vehicles', [VehicleController::class, 'assignedVehicles']);
    Route::get('/vehicles/mine', [VehicleController::class, 'myVehicles']);
    Route::get('/vehicles/within-premises', [VehicleController::class, 'vehiclesWithinPremises']);
    Route::get('/vehicles/search-by-plate', [VehicleController::class, 'searchByPlate']);
    
    // 📷 Vehicle Photo Routes
    Route::post('/vehicles/{vehicle}/photos', [VehicleController::class, 'uploadPhoto']);
    Route::delete('/vehicles/{vehicle}/photos', [VehicleController::class, 'deletePhoto']);
    Route::put('/vehicles/{vehicle}/photos/primary', [VehicleController::class, 'setPrimaryPhoto']);
    
    Route::apiResource('vehicles', VehicleController::class);

    // ✅ Drivers
    Route::get('/drivers/{id}', [DriverController::class, 'show']);
    Route::get('/drivers/{id}/export-trips-excel', [DriverController::class, 'exportDriverTripsExcel']);
    Route::get('/vehicles/{vehicle}/driver-user-id', [DriverController::class, 'getDriverUserIdByVehicle']);
    Route::get('/driver/me', [DriverController::class, 'me']);
    Route::apiResource('drivers', DriverController::class);

    // ✅ Check-In/Out
    Route::post('/checkins/{id}/checkout', [CheckInOutController::class, 'checkout']);
    Route::get('/checkins/latest', [CheckInOutController::class, 'latest']);
    Route::apiResource('checkins', CheckInOutController::class);

    // ✅ Maintenance & Expenses
    Route::get('/vehicles/{id}/maintenance', [MaintenanceController::class, 'byVehicle']);
    
    // 📎 Maintenance Attachment Routes
    Route::post('/maintenance/{maintenance}/attachments', [MaintenanceController::class, 'uploadAttachment']);
    Route::delete('/maintenance/{maintenance}/attachments', [MaintenanceController::class, 'deleteAttachment']);
    
    Route::apiResource('maintenance', MaintenanceController::class);
    Route::apiResource('expenses', ExpenseController::class);

    // ✅ Income
    Route::apiResource('incomes', IncomeController::class);

    // ✅ Trip Logs
    Route::get('/trips/all', [TripController::class, 'all']);
    Route::apiResource('trips', TripController::class);

    // ✅ Audit Trail Logs
    Route::get('/audit-trail', [AuditTrailController::class, 'index']);
    Route::get('/audit-trail/{id}', [AuditTrailController::class, 'show']);

    // ✅ User Profile
    Route::get('/profile', [UserController::class, 'profile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    Route::get('/profile/history', [UserController::class, 'profileHistory']);
    
    // 👤 Profile Avatar Routes
    Route::post('/profile/avatar', [UserController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [UserController::class, 'deleteAvatar']);
    
    // 🔒 Password Change Route
    Route::put('/profile/password', [UserController::class, 'changePassword']);
});