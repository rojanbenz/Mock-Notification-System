import { FastifyRequest, FastifyReply } from "fastify";
import { NotificationService } from "../../services/notification.service";
import { Logger } from "../../utils/logger";

export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly logger: Logger
  ) {}

  async getRecentNotifications(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = req.params as { userId: string };
      //Check here fo real implementation
      this.logger.info(`Fetching recent notifications for user ${userId}`);
      reply.send({ message: `Recent notifications for user ${userId}` });
    } catch (error) {
      this.logger.error("Error fetching recent notifications", error);
      reply.status(500).send({ error: "Internal server error" });
    }
  }

  async getNotificationSummary(req: FastifyRequest, reply: FastifyReply) {
    try {
      const { userId } = req.params as { userId: string };
      //Check here fo real implementation
      this.logger.info(`Fetching notification summary for user ${userId}`);
      reply.send({ message: `Notification summary for user ${userId}` });
    } catch (error) {
      this.logger.error("Error fetching notification summary", error);
      reply.status(500).send({ error: "Internal server error" });
    }
  }
}
