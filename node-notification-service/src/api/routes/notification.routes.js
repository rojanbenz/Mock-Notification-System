"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notificationRoutes;
const notification_controller_1 = require("../controllers/notification.controller");
const notification_service_1 = require("../../services/notification.service");
const logger_1 = require("../../utils/logger");
async function notificationRoutes(fastify) {
    const logger = new logger_1.Logger(fastify.log);
    const notificationService = new notification_service_1.NotificationService(logger);
    const controller = new notification_controller_1.NotificationController(notificationService, logger);
    fastify.get("/recent/:userId", controller.getRecentNotifications.bind(controller));
    fastify.get("/summary/:userId", controller.getNotificationSummary.bind(controller));
}
