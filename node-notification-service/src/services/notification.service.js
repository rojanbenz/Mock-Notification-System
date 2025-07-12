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
        var _a;
        const retryCount = (_a = message.retryCount) !== null && _a !== void 0 ? _a : 0;
        try {
            // ✅ Fixed: Use backticks for string interpolation
            this.logger.info(`Sending ${message.type} notification to user ${message.user_id}`, {
                message: message.message,
                retryCount,
            });
            // Simulated failure (for testing)
            if (Math.random() < 0.7)
                throw new Error("Random failure");
            // This won't run due to forced failure above
            await this.updateNotificationStatus(message.notification_id, {
                success: true,
            });
            return true;
        }
        catch (error) {
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
                error.shouldRetry = true;
                error.retryCount = retryCount + 1;
                throw error; // Re-throw to trigger requeue in queue service
            }
            return false;
        }
    }
    async updateNotificationStatus(notificationId, status) {
        try {
            // ✅ Fixed: Backticks for URL template literal
            const url = `${config_1.default.laravel.baseUrl}/notifications/${notificationId}/status`;
            console.log("Updating Laravel with status...");
            console.log(status, "Status payload");
            await axios_1.default.post(url, {
                success: status.success,
                retry_count: status.retryCount,
            }, {
                timeout: 5000,
                httpAgent: new http_1.default.Agent({ keepAlive: true }),
                httpsAgent: new https_1.default.Agent({
                    keepAlive: true,
                    rejectUnauthorized: false,
                }),
            });
        }
        catch (error) {
            this.logger.error("Failed to update notification status in Laravel", {
                notificationId,
                error,
            });
            throw error;
        }
    }
}
exports.NotificationService = NotificationService;
