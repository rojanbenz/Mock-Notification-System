<?php

namespace App\Services;

use App\Models\Notification;
use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class NotificationService
{
    protected $rabbitMQConnection;
    
    public function __construct()
    {
        $this->rabbitMQConnection = new AMQPStreamConnection(
            env('RABBITMQ_HOST'),
            env('RABBITMQ_PORT'),
            env('RABBITMQ_USER'),
            env('RABBITMQ_PASSWORD')
        );
    }
    
    public function createNotification(array $data): Notification
    {
        // Rate limiting check
        $recentCount = Notification::where('user_id', $data['user_id'])
            ->where('created_at', '>=', now()->subHour())
            ->count();
            
        if ($recentCount >= 10) {
            throw new \Exception('Rate limit exceeded: Maximum 10 notifications per hour');
        }
        
        $notification = Notification::create([
            'user_id' => $data['user_id'],
            'type' => $data['type'],
            'message' => $data['message'],
            'status' => 'pending'
        ]);
        
        $this->publishToQueue($notification);
        
        return $notification;
    }
    
    protected function publishToQueue(Notification $notification)
    {
        $channel = $this->rabbitMQConnection->channel();
        
        $channel->queue_declare('notifications', false, true, false, false);
        
        $message = new AMQPMessage(json_encode([
            'notification_id' => $notification->id,
            'user_id' => $notification->user_id,
            'type' => $notification->type,
            'message' => $notification->message
        ]), ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT]);
        
        $channel->basic_publish($message, '', 'notifications');
        
        $channel->close();
        $this->rabbitMQConnection->close();
    }
    
    public function markAsProcessed(int $notificationId, bool $success = true)
    {
        $notification = Notification::findOrFail($notificationId);
        
        $notification->update([
            'status' => $success ? 'sent' : 'failed',
            'processed_at' => now(),
            'retry_count' => $notification->retry_count + (!$success ? 1 : 0)
        ]);
        
        return $notification;
    }
    
    public function getRecentNotifications(string $userId, int $limit = 10)
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
    
    public function getNotificationSummary(string $userId)
    {
        return [
            'total' => Notification::where('user_id', $userId)->count(),
            'sent' => Notification::where('user_id', $userId)->where('status', 'sent')->count(),
            'failed' => Notification::where('user_id', $userId)->where('status', 'failed')->count(),
            'pending' => Notification::where('user_id', $userId)->where('status', 'pending')->count(),
        ];
    }
}