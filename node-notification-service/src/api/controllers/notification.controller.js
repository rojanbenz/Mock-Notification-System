"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
class NotificationController {
    constructor(notificationService, logger) {
        this.notificationService = notificationService;
        this.logger = logger;
    }
    async getRecentNotifications(req, reply) {
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
    }
    async getNotificationSummary(req, reply) {
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
    }
}
exports.NotificationController = NotificationController;
