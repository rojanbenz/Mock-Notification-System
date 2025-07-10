<?php

namespace App\Http\Middleware;

use App\Models\Notification;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NotificationRateLimit
{
    public function handle(Request $request, Closure $next): Response
    {
        $userId = $request->input('user_id');
        
        $count = Notification::where('user_id', $userId)
            ->where('created_at', '>=', now()->subHour())
            ->count();
            
        if ($count >= 10) {
            return response()->json([
                'error' => 'Rate limit exceeded. Maximum 10 notifications per hour.'
            ], 429);
        }
        
        return $next($request);
    }
}