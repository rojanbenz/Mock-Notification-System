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
exports.default = notificationRoutes;
const notification_controller_1 = require("../controllers/notification.controller");
const notification_service_1 = require("../../services/notification.service");
const logger_1 = require("../../utils/logger");
function notificationRoutes(fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new logger_1.Logger(fastify.log);
        const notificationService = new notification_service_1.NotificationService(logger);
        const controller = new notification_controller_1.NotificationController(notificationService, logger);
        fastify.get("/recent/:userId", controller.getRecentNotifications.bind(controller));
        fastify.get("/summary/:userId", controller.getNotificationSummary.bind(controller));
    });
}
