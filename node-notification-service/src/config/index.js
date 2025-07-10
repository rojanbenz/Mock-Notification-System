"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    rabbitMQ: {
        url: "amqp://localhost",
        queue: "notifications",
        retryQueue: "notifications_retry",
        maxRetries: 3,
        retryDelay: 5000,
    },
    laravel: {
        baseUrl: "http://localhost:8000/api",
        updateEndpoint: "/notifications/:notificationId/status",
    },
    server: {
        port: 3000,
    },
};
