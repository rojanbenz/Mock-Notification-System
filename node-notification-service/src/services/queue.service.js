"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const amqp = __importStar(require("amqplib/callback_api"));
const config_1 = __importDefault(require("../config"));
class QueueService {
    constructor(logger) {
        this.logger = logger;
        this.connection = null;
        this.channel = null;
    }
    async connect() {
        return new Promise((resolve, reject) => {
            amqp.connect(config_1.default.rabbitMQ.url, (err, conn) => {
                if (err) {
                    this.logger.error("Failed to connect to RabbitMQ", err);
                    return reject(err);
                }
                this.connection = conn;
                conn.createChannel((err, ch) => {
                    if (err) {
                        this.logger.error("Failed to create channel", err);
                        return reject(err);
                    }
                    this.channel = ch;
                    this.channel.assertQueue(config_1.default.rabbitMQ.queue, { durable: true }, (err) => {
                        if (err)
                            return reject(err);
                        this.logger.info("Connected to RabbitMQ");
                        resolve();
                    });
                });
            });
        });
    }
    async consume(callback) {
        if (!this.channel)
            throw new Error("Channel not initialized");
        this.channel.consume(config_1.default.rabbitMQ.queue, async (msg) => {
            var _a;
            if (!msg)
                return;
            try {
                const raw = JSON.parse(msg.content.toString());
                const retryCount = (_a = raw.retryCount) !== null && _a !== void 0 ? _a : 0; // ✅ ADDED
                const content = { ...raw, retryCount }; // ✅ ADDED
                this.logger.info("Processing notification", {
                    notificationId: content.notification_id,
                    retryCount,
                });
                const success = await callback(content);
                if (success) {
                    this.channel.ack(msg);
                    this.logger.info("Notification processed successfully", {
                        notificationId: content.notification_id,
                    });
                }
                else {
                    this.logger.warn("Notification failed after retries. Discarding.", {
                        notificationId: content.notification_id,
                        retryCount,
                    });
                    this.channel.nack(msg, false, false); // Discard permanently
                }
            }
            catch (error) {
                if (error.shouldRetry && error.retryCount <= 3) {
                    // ✅ RETRY LOGIC: Requeue message
                    this.logger.warn("Retrying notification processing", {
                        retryCount: error.retryCount,
                    });
                    const retryMessage = {
                        ...JSON.parse(msg.content.toString()),
                        retryCount: error.retryCount,
                    };
                    this.channel.sendToQueue(config_1.default.rabbitMQ.queue, Buffer.from(JSON.stringify(retryMessage)), { persistent: true });
                    this.channel.ack(msg); // ✅ Acknowledge original message
                }
                else {
                    this.logger.error("Error processing message. Discarding.", error);
                    this.channel.nack(msg, false, false); // Discard permanently
                }
            }
        }, { noAck: false });
    }
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.channel && !this.connection) {
                return resolve();
            }
            const cleanup = () => {
                this.channel = null;
                this.connection = null;
                this.logger.info("Closed RabbitMQ connection");
                resolve();
            };
            let closed = 0;
            const checkDone = () => ++closed === 2 && cleanup();
            const handleError = (err) => {
                this.logger.error("Error closing RabbitMQ connection", err);
                reject(err);
            };
            if (this.channel) {
                this.channel.close((err) => (err ? handleError(err) : checkDone()));
            }
            else {
                checkDone();
            }
            if (this.connection) {
                this.connection.close((err) => (err ? handleError(err) : checkDone()));
            }
            else {
                checkDone();
            }
        });
    }
}
exports.QueueService = QueueService;
