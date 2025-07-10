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
server.get("/health", () => __awaiter(void 0, void 0, void 0, function* () {
    return { status: "ok" };
}));
// Start the server and queue consumer
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Initialize services
        const queueService = new queue_service_1.QueueService(logger);
        const notificationService = new notification_service_1.NotificationService(logger);
        // Connect to RabbitMQ
        yield queueService.connect();
        // Start consuming messages
        yield queueService.consume((msg) => notificationService.processNotification(msg));
        // Start the server
        yield server.listen({ port: config_1.default.server.port });
        logger.info(`Server listening on port ${config_1.default.server.port}`);
        // Graceful shutdown
        process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info("SIGTERM received. Shutting down gracefully...");
            yield queueService.close();
            yield server.close();
            process.exit(0);
        }));
        process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
            logger.info("SIGINT received. Shutting down gracefully...");
            yield queueService.close();
            yield server.close();
            process.exit(0);
        }));
    }
    catch (error) {
        logger.error("Failed to start server", error);
        process.exit(1);
    }
});
start();
