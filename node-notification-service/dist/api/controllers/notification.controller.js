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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
class NotificationController {
    constructor(notificationService, logger) {
        this.notificationService = notificationService;
        this.logger = logger;
    }
    getRecentNotifications(req, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                //Check here fo real implementation
                this.logger.info(`Fetching recent notifications for user ${userId}`);
                reply.send({ message: `Recent notifications for user ${userId}` });
            }
            catch (error) {
                this.logger.error("Error fetching recent notifications", error);
                reply.status(500).send({ error: "Internal server error" });
            }
        });
    }
    getNotificationSummary(req, reply) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId } = req.params;
                //Check here fo real implementation
                this.logger.info(`Fetching notification summary for user ${userId}`);
                reply.send({ message: `Notification summary for user ${userId}` });
            }
            catch (error) {
                this.logger.error("Error fetching notification summary", error);
                reply.status(500).send({ error: "Internal server error" });
            }
        });
    }
}
exports.NotificationController = NotificationController;
