"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const axios_1 = __importDefault(require("axios"));
const config_1 = __importDefault(require("../config"));
class NotificationService {
    constructor(logger) {
        this.logger = logger;
    }
    processNotification(message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //simulate notification processing
                this.logger.info(`Sending ${message.type} notification to user ${message.user_id}`, {
                    message: message.message,
                });
                //simulate random failure for testing retry logic
                if (Math.random() < 0.2) {
                    //20% chance of failure
                    throw new Error("Random failure for testing");
                }
                //Update status in laravel
                yield this.updateNotificationStatus(message.notification_id, {
                    success: true,
                });
                return true;
            }
            catch (error) {
                this.logger.error("Failed to process notification", {
                    notificationId: message.notification_id,
                    error,
                });
                //Update status in laravel
                yield this.updateNotificationStatus(message.notification_id, {
                    success: false,
                    retryCount: error.retryCount,
                });
                return false;
            }
        });
    }
    updateNotificationStatus(notificationId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield axios_1.default.post(`${config_1.default.laravel.baseUrl}/notifications/$notificationId/status`, {
                    success: status.success,
                    retry_cound: status.retryCount,
                });
            }
            catch (error) {
                this.logger.error("Faield to update notification status in laravel", {
                    notificationId,
                    error,
                });
                throw error;
            }
        });
    }
}
exports.NotificationService = NotificationService;
