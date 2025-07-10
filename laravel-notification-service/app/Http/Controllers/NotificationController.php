<?php

namespace App\Http\Controllers;

use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;



class NotificationController extends Controller
{
    protected $notificationService;
    
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|string',
            'type' => 'required|string|in:email,sms,push',
            'message' => 'required|string|max:500'
        ]);
        
        try {
            $notification = $this->notificationService->createNotification($validated);
            return response()->json($notification, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    
    public function recent(string $userId)
    {
        $notifications = $this->notificationService->getRecentNotifications($userId);
        return response()->json($notifications);
    }
    
    public function summary(string $userId)
    {
        $summary = $this->notificationService->getNotificationSummary($userId);
        return response()->json($summary);
    }

    public function updateStatus(Notification $notification, Request $request)
{
    $validated = $request->validate([
        'success' => 'required|boolean',
        'retry_count' => 'nullable|integer'
    ]);
    
    $notification = $this->notificationService->markAsProcessed(
        $notification->id,
        $validated['success']
    );

    //  Log::info('Notification updateStatus response:', [
    //     'notification_id' => $notification->id,
    //     'status' => $notification->status ?? 'unknown', 
    //     'response' => $notification
    // ]);
    
    return response()->json($notification);
}
}