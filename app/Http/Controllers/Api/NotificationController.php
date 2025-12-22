<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications for authenticated user
     */
    public function index(Request $request)
    {
        $query = auth()->user()->notifications();
        
        // Filter by read/unread
        if ($request->has('unread_only') && $request->unread_only) {
            $query->whereNull('read_at');
        }
        
        $notifications = $query->latest()->paginate($request->get('per_page', 20));
        
        return response()->json($notifications);
    }

    /**
     * Get unread notification count
     */
    public function unreadCount()
    {
        $count = auth()->user()->unreadNotifications()->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Mark a specific notification as read
     */
    public function markAsRead($id)
    {
        $notification = auth()->user()
            ->notifications()
            ->where('id', $id)
            ->first();
        
        if ($notification) {
            $notification->markAsRead();
            return response()->json([
                'message' => 'Notification marked as read',
                'notification' => $notification
            ]);
        }
        
        return response()->json(['message' => 'Notification not found'], 404);
    }

    /**
     * Mark all notifications as read
     */
    public function markAllAsRead()
    {
        auth()->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a specific notification
     */
    public function destroy($id)
    {
        $notification = auth()->user()
            ->notifications()
            ->where('id', $id)
            ->first();
        
        if ($notification) {
            $notification->delete();
            return response()->json(['message' => 'Notification deleted']);
        }
        
        return response()->json(['message' => 'Notification not found'], 404);
    }

    /**
     * Delete all read notifications
     */
    public function deleteAllRead()
    {
        auth()->user()->notifications()->whereNotNull('read_at')->delete();
        return response()->json(['message' => 'All read notifications deleted']);
    }
}