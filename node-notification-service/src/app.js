"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const notification_routes_1 = __importDefault(require("./api/routes/notification.routes"));
const queue_service_1 = require("./services/queue.service");
const notification_service_1 = require("./services/notification.service");
const logger_1 = require("./utils/logger");
const config_1 = __importDefault(require("./config"));
const server = (0, fastify_1.default)({ logger: true });
const logger = new logger_1.Logger(server.log);
// Register routes
server.register(notification_routes_1.default, { prefix: "/api/notifications" });
// Health check endpoint
server.get("/health", async () => {
    return { status: "ok" };
});
// Start the server and queue consumer
const start = async () => {
    try {
        console.log("Starting server...");
        // Initialize services
        const queueService = new queue_service_1.QueueService(logger);
        console.log("QueueService initialized");
        const notificationService = new notification_service_1.NotificationService(logger);
        console.log("NotificationService initialized");
        // Connect to RabbitMQ
        const data = await queueService.connect();
        console.log(data);
        // Start consuming messages
        await queueService.consume((msg) => notificationService.processNotification(msg));
        console.log("Started consuming messages from RabbitMQ");
        // Start the server
        await server.listen({ port: config_1.default.server.port });
        logger.info(`Server listening on port ${config_1.default.server.port}`);
        console.log(`Server listening on port ${config_1.default.server.port}`);
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
    }
    catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
};
start();
