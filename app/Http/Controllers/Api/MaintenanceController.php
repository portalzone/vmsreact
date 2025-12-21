<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maintenance;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Events\MaintenanceStatusUpdated; // ✅ Added

class MaintenanceController extends Controller
{
    public function index()
    {
        $this->authorizeAccess('view');
        $user = auth()->user();

        if ($user->hasRole('admin') || $user->hasRole('manager')) {
            return Maintenance::with(['vehicle', 'expense', 'createdBy', 'updatedBy'])->latest()->get();
        }

        if ($user->hasRole('vehicle_owner')) {
            return Maintenance::whereHas('vehicle', function ($q) use ($user) {
                $q->where('owner_id', $user->id);
            })->with(['vehicle', 'expense', 'createdBy', 'updatedBy'])->latest()->get();
        }

        if ($user->hasRole('driver')) {
            return Maintenance::whereHas('vehicle.drivers', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })->with(['vehicle', 'expense', 'createdBy', 'updatedBy'])->latest()->get();
        }

        return response()->json(['message' => 'Forbidden'], 403);
    }

    public function store(Request $request)
    {
        $this->authorizeAccess('create');

        $validated = $request->validate([
            'vehicle_id'  => 'required|exists:vehicles,id',
            'description' => 'required|string',
            'status'      => 'required|string|in:Pending,in_progress,Completed',
            'cost'        => 'nullable|numeric',
            'date'        => 'required|date',
        ]);

        $userId = auth()->id();
        $user = auth()->user();

        if (in_array($validated['status'], ['Completed']) && $user->hasRole(['driver', 'vehicle_owner'])) {
            return response()->json(['error' => 'You are not authorized to mark maintenance as completed.'], 403);
        }

        $maintenanceData = [
            'vehicle_id'  => $validated['vehicle_id'],
            'description' => $validated['description'],
            'status'      => $validated['status'],
            'date'        => $validated['date'],
            'created_by'  => $userId,
            'updated_by'  => $userId,
            'cost'        => $validated['cost'] ?? 0,
        ];

        if ($validated['status'] === 'Completed') {
            $maintenanceData['cost'] = $validated['cost'] ?? 0;
        }

        $maintenance = Maintenance::create($maintenanceData);

        if ($maintenance->status === 'Completed') {
            Expense::create([
                'vehicle_id'     => $maintenance->vehicle_id,
                'maintenance_id' => $maintenance->id,
                'amount'         => $maintenance->cost ?? 0,
                'description'    => 'Maintenance: ' . $maintenance->description,
                'date'           => $maintenance->date,
                'created_by'     => $userId,
                'updated_by'     => $userId,
            ]);
        }

        return response()->json($maintenance->load(['vehicle', 'expense', 'createdBy', 'updatedBy']), 201);
    }

    public function show($id)
    {
        $this->authorizeAccess('view');
        $record = Maintenance::with(['vehicle', 'expense', 'createdBy', 'updatedBy'])->findOrFail($id);
        return response()->json($record);
    }

    // ✅ Update method with Broadcast Integration
    public function update(Request $request, $id)
    {
        $this->authorizeAccess('update');

        $maintenance = Maintenance::findOrFail($id);
        $oldStatus = $maintenance->status; // Capture old status for comparison

        $validated = $request->validate([
            'vehicle_id'  => 'sometimes|exists:vehicles,id',
            'description' => 'sometimes|string',
            'status'      => 'sometimes|string|in:Pending,in_progress,Completed',
            'cost'        => 'nullable|numeric',
            'date'        => 'sometimes|date',
        ]);

        if (isset($validated['status']) && $validated['status'] === 'Completed' && auth()->user()->hasAnyRole(['driver', 'vehicle_owner'])) {
            return response()->json(['error' => 'You are not authorized to mark maintenance as completed.'], 403);
        }

        $maintenance->update([
            ...$validated,
            'updated_by' => auth()->id(),
        ]);

        // 1. Handle Expense Update
        if (($validated['status'] ?? $maintenance->status) === 'Completed') {
            $expenseData = [
                'vehicle_id'     => $maintenance->vehicle_id,
                'amount'         => $maintenance->cost ?? 0,
                'description'    => 'Maintenance: ' . $maintenance->description,
                'date'           => $maintenance->date,
                'updated_by'     => auth()->id(),
            ];

            if ($maintenance->expense) {
                $maintenance->expense->update($expenseData);
            } else {
                $expenseData['maintenance_id'] = $maintenance->id;
                $expenseData['created_by'] = auth()->id();
                Expense::create($expenseData);
            }
        }

        // 2. 📡 Broadcast Event if Status Changed
        if ($oldStatus !== $maintenance->status) {
            broadcast(new MaintenanceStatusUpdated($maintenance))->toOthers();
        }

        return response()->json($maintenance->load(['vehicle', 'expense', 'createdBy', 'updatedBy']));
    }

    public function byVehicle($id)
    {
        $this->authorizeAccess('view');
        return Maintenance::with('expense')
            ->where('vehicle_id', $id)
            ->orderByDesc('date')
            ->get();
    }

    /**
     * Upload attachment
     */
    public function uploadAttachment(Request $request, Maintenance $maintenance)
    {
        $this->authorizeAccess('update');

        $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpeg,jpg,png,gif,pdf,doc,docx,xls,xlsx',
                'max:10240', // 10MB
            ],
        ]);

        try {
            $file = $request->file('file');
            $path = $maintenance->uploadImage($file, 'maintenance-attachments');
            
            // Get current attachments
            $attachments = $maintenance->attachments ?? [];
            $attachments[] = [
                'name' => $file->getClientOriginalName(),
                'path' => $path,
                'type' => $file->getMimeType(),
                'size' => $file->getSize(),
            ];
            
            // Update maintenance
            $maintenance->update([
                'attachments' => $attachments,
                'updated_by' => Auth::id(),
            ]);
            
            return response()->json([
                'message' => 'Attachment uploaded successfully',
                'attachment' => [
                    'name' => $file->getClientOriginalName(),
                    'url' => $maintenance->getImageUrl($path),
                    'type' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ],
                'maintenance' => $maintenance->load(['vehicle', 'createdBy', 'updatedBy'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Attachment upload failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to upload attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete attachment
     */
    public function deleteAttachment(Request $request, Maintenance $maintenance)
    {
        $this->authorizeAccess('update');

        $request->validate([
            'path' => 'required|string'
        ]);

        try {
            $pathToDelete = $request->path;
            
            // Delete from storage
            $maintenance->deleteImage($pathToDelete);
            
            // Remove from attachments array
            $attachments = $maintenance->attachments ?? [];
            $attachments = array_filter($attachments, fn($att) => $att['path'] !== $pathToDelete);
            
            // Update maintenance
            $maintenance->update([
                'attachments' => array_values($attachments),
                'updated_by' => Auth::id(),
            ]);
            
            return response()->json([
                'message' => 'Attachment deleted successfully',
                'maintenance' => $maintenance->load(['vehicle', 'createdBy', 'updatedBy'])
            ]);
        } catch (\Exception $e) {
            \Log::error('Attachment deletion failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $this->authorizeAccess('delete');

        $maintenance = Maintenance::findOrFail($id);
        
        // Delete all attachments before deleting maintenance
        if ($maintenance->attachments) {
            foreach ($maintenance->attachments as $attachment) {
                $maintenance->deleteImage($attachment['path'] ?? null);
            }
        }
        
        Expense::where('maintenance_id', $maintenance->id)->delete();
        $maintenance->delete();

        return response()->json(['message' => 'Maintenance record and expense deleted.']);
    }

    private function authorizeAccess(string $action)
    {
        $user = auth()->user();

        $map = [
            'view'   => ['admin', 'manager', 'vehicle_owner', 'driver'],
            'create' => ['admin', 'manager', 'vehicle_owner', 'driver'],
            'update' => ['admin', 'manager', 'driver'],
            'delete' => ['admin'],
        ];

        $allowedRoles = $map[$action] ?? [];

        if (!$user || !$user->hasAnyRole($allowedRoles)) {
            \Log::warning("Unauthorized {$action} attempt by user ID {$user?->id}");
            abort(403, 'Unauthorized for this action.');
        }
    }
}