import { FastifyInstance } from "fastify";
import { NotificationController } from "../controllers/notification.controller";
import { NotificationService } from "../../services/notification.service";
import { Logger } from "../../utils/logger";

export default async function notificationRoutes(fastify: FastifyInstance) {
  const logger = new Logger(fastify.log);
  const notificationService = new NotificationService(logger);
  const controller = new NotificationController(notificationService, logger);

  fastify.get(
    "/recent/:userId",
    controller.getRecentNotifications.bind(controller)
  );
  fastify.get(
    "/summary/:userId",
    controller.getNotificationSummary.bind(controller)
  );
}
