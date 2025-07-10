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
    try {
      //simulate notification processing
      this.logger.info(
        `Sending ${message.type} notification to user ${message.user_id}`,
        {
          message: message.message,
        }
      );

      //simulate random failure for testing retry logic
      // if (Math.random() < 0.2) {
      //20% chance of failure
      // throw new Error("Random failure for testing");
      // }

      //Update status in laravel
      await this.updateNotificationStatus(message.notification_id, {
        success: true,
      });

      return true;
    } catch (error) {
      console.log("what69");
      this.logger.error("Failed to process notification", {
        notificationId: message.notification_id,
        error,
      });

      //Update status in laravel
      await this.updateNotificationStatus(message.notification_id, {
        success: false,
        retryCount: (error as any).retryCount,
      });
      return false;
    }
  }

  private async updateNotificationStatus(
    notificationId: number,
    status: NotificationStatusUpdate
  ): Promise<void> {
    try {
      const url = `${config.laravel.baseUrl}/notifications/${notificationId}/status`;
      console.log("sagar k pul k niche");
      console.log(status,"sagar k pul k niche status");
      await axios.post(
        url,
        {
          success: status.success,
          retry_count: status.retryCount,
        },
        {
          timeout: 5000, // Add timeout
          httpAgent: new http.Agent({ keepAlive: true }), // Better HTTP handling
          httpsAgent: new https.Agent({
            keepAlive: true,
            rejectUnauthorized: false,
          }), // For HTTPS cases
        }
      );
    } catch (error) {
      return console.log("what");
      this.logger.error("Failed to update notification status in Laravel", {
        notificationId,
        error, // Log just the message to avoid circular references
      });
      throw error;
    }
  }
}
