export interface NotificationMessage {
  notification_id: number;
  user_id: string;
  type: "email" | "sms" | "push";
  message: string;
  retryCount?: number; // ✅ ADDED: Optional retry count
}

export interface NotificationStatusUpdate {
  success: boolean;
  retryCount?: number;
}

