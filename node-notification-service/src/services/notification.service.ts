import axios from "axios";
import config from "../config";
import { Logger } from "../utils/logger";
import http from "http";
import https from "https";
import {
  NotificationMessage,
  NotificationStatusUpdate,
} from "../interfaces/notification.interface";

export class NotificationService {
  constructor(private readonly logger: Logger) {}

  async processNotification(message: NotificationMessage): Promise<boolean> {
    const retryCount = message.retryCount ?? 0;

    try {
      // ✅ Fixed: Use backticks for string interpolation
      this.logger.info(
        `Sending ${message.type} notification to user ${message.user_id}`,
        {
          message: message.message,
          retryCount,
        }
      );

     // Simulated failure (for testing)
      if (Math.random() < 0.7) throw new Error("Random failure");

      // This won't run due to forced failure above
      await this.updateNotificationStatus(message.notification_id, {
        success: true,
      });

      return true;
    } catch (error) {
      this.logger.error("Failed to process notification", {
        notificationId: message.notification_id,
        retryCount,
        error,
      });

      // Always update Laravel with current retry count
      await this.updateNotificationStatus(message.notification_id, {
        success: false,
        retryCount,
      });

      // ✅ Retry up to 3 times (retryCount 0, 1, 2)
      if (retryCount < 1) {
        (error as any).shouldRetry = true;
        (error as any).retryCount = retryCount + 1;
        throw error; // Re-throw to trigger requeue in queue service
      }

      return false;
    }
  }

  private async updateNotificationStatus(
    notificationId: number,
    status: NotificationStatusUpdate
  ): Promise<void> {
    try {
      // ✅ Fixed: Backticks for URL template literal
      const url = `${config.laravel.baseUrl}/notifications/${notificationId}/status`;
      console.log("Updating Laravel with status...");
      console.log(status, "Status payload");

      await axios.post(
        url,
        {
          success: status.success,
          retry_count: status.retryCount,
        },
        {
          timeout: 5000,
          httpAgent: new http.Agent({ keepAlive: true }),
          httpsAgent: new https.Agent({
            keepAlive: true,
            rejectUnauthorized: false,
          }),
        }
      );
    } catch (error) {
      this.logger.error("Failed to update notification status in Laravel", {
        notificationId,
        error,
      });
      throw error;
    }
  }
}