"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
class NotificationService {
    constructor(logger) {
        this.logger = logger;
    }
    async processNotification(message) {
        try {
            //simulate notification processing
            this.logger.info(`Sending ${message.type} notification to user ${message.user_id}`, {
                message: message.message,
            });
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
        }
        catch (error) {
            console.log("what69");
            this.logger.error("Failed to process notification", {
                notificationId: message.notification_id,
                error,
            });
            //Update status in laravel
            await this.updateNotificationStatus(message.notification_id, {
                success: false,
                retryCount: error.retryCount,
            });
            return false;
        }
    }
    async updateNotificationStatus(notificationId, status) {
        try {
            const url = `${config_1.default.laravel.baseUrl}/notifications/${notificationId}/status`;
            await axios_1.default.post(url, {
                success: status.success,
                retry_count: status.retryCount,
            }, {
                timeout: 5000, // Add timeout
                httpAgent: new http_1.default.Agent({ keepAlive: true }), // Better HTTP handling
                httpsAgent: new https_1.default.Agent({
                    keepAlive: true,
                    rejectUnauthorized: false,
                }), // For HTTPS cases
            });
        }
        catch (error) {
            return console.log("what");
            this.logger.error("Failed to update notification status in Laravel", {
                notificationId,
                error, // Log just the message to avoid circular references
            });
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
