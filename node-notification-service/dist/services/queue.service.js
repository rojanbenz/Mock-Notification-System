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
exports.QueueService = void 0;
const amqp = __importStar(require("amqplib"));
const config_1 = __importDefault(require("../config"));
class QueueService {
    constructor(logger) {
        this.logger = logger;
        this.connection = null;
        this.channel = null;
        this.retryChannel = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.connection = yield amqp.connect(config_1.default.rabbitMQ.url);
                this.channel = yield this.connection.createChannel();
                this.retryChannel = yield this.connection.createChannel();
                yield this.channel.assertQueue(config_1.default.rabbitMQ.queue, { durable: true });
                yield this.retryChannel.assertQueue(config_1.default.rabbitMQ.retryQueue, {
                    durable: true,
                    deadLetterExchange: '',
                    deadLetterRoutingKey: config_1.default.rabbitMQ.queue,
                    messageTtl: config_1.default.rabbitMQ.retryDelay
                });
                this.logger.info('Connected to RabbitMQ');
            }
            catch (error) {
                this.logger.error('Failed to connect to RabbitMQ', error);
                throw error;
            }
        });
    }
    consume(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.channel) {
                throw new Error('Channel not initialized');
            }
            this.channel.consume(config_1.default.rabbitMQ.queue, (message) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                if (!message)
                    return;
                try {
                    const content = JSON.parse(message.content.toString());
                    this.logger.info('Processing notification', { notificationId: content.notification_id });
                    const success = yield callback(content);
                    if (success) {
                        (_a = this.channel) === null || _a === void 0 ? void 0 : _a.ack(message);
                        this.logger.info('Notification processed successfully', { notificationId: content.notification_id });
                    }
                    else {
                        this.handleRetry(message, content);
                    }
                }
                catch (error) {
                    this.logger.error('Error processing message', error);
                    (_b = this.channel) === null || _b === void 0 ? void 0 : _b.nack(message);
                }
            }));
        });
    }
    handleRetry(message, content) {
        var _a, _b, _c, _d;
        const retryCount = (((_a = message.properties.headers) === null || _a === void 0 ? void 0 : _a['x-retry-count']) || 0) + 1;
        if (retryCount >= config_1.default.rabbitMQ.maxRetries) {
            this.logger.warn('Max retries reached, discarding message', {
                notificationId: content.notification_id,
                retryCount
            });
            (_b = this.channel) === null || _b === void 0 ? void 0 : _b.ack(message);
            return;
        }
        this.logger.warn('Scheduling message for retry', {
            notificationId: content.notification_id,
            retryCount
        });
        (_c = this.retryChannel) === null || _c === void 0 ? void 0 : _c.sendToQueue(config_1.default.rabbitMQ.retryQueue, Buffer.from(JSON.stringify(content)), {
            headers: Object.assign(Object.assign({}, message.properties.headers), { 'x-retry-count': retryCount })
        });
        (_d = this.channel) === null || _d === void 0 ? void 0 : _d.ack(message);
    }
    close() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c;
            try {
                yield ((_a = this.channel) === null || _a === void 0 ? void 0 : _a.close());
                yield ((_b = this.retryChannel) === null || _b === void 0 ? void 0 : _b.close());
                yield ((_c = this.connection) === null || _c === void 0 ? void 0 : _c.close());
                this.logger.info('Closed RabbitMQ connection');
            }
            catch (error) {
                this.logger.error('Error closing RabbitMQ connection', error);
            }
        });
    }
}
exports.QueueService = QueueService;
