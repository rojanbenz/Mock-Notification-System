import fastify from "fastify";
import notificationRoutes from "./api/routes/notification.routes";
import { QueueService } from "./services/queue.service";
import { NotificationService } from "./services/notification.service";
import { Logger } from "./utils/logger";
import config from "./config";

const server = fastify({ logger: true });
const logger = new Logger(server.log);

// Register routes
server.register(notificationRoutes, { prefix: "/api/notifications" });

// Health check endpoint
server.get("/health", async () => {
  return { status: "ok" };
});

// Start the server and queue consumer
const start = async () => {
  try {
    console.log("Starting server...");
    // Initialize services
    const queueService = new QueueService(logger);
    console.log("QueueService initialized");
    const notificationService = new NotificationService(logger);
    console.log("NotificationService initialized");

    
    // Connect to RabbitMQ
    const data = await queueService.connect();
    console.log(data);
    // Start consuming messages
    await queueService.consume((msg) =>
      notificationService.processNotification(msg)
    );
    console.log("Started consuming messages from RabbitMQ");
    // Start the server
    await server.listen({ port: config.server.port });
    logger.info(`Server listening on port ${config.server.port}`);
    console.log(`Server listening on port ${config.server.port}`);
    // Graceful shutdown
    process.on("SIGTERM", async () => {
      logger.info("SIGTERM received. Shutting down gracefully...");
      await queueService.close();
      await server.close();
      process.exit(0);
    });

    process.on("SIGINT", async () => {
      logger.info("SIGINT received. Shutting down gracefully...");
      await queueService.close();
      await server.close();
      process.exit(0);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
    process.exit(1);
  }
};

start();
