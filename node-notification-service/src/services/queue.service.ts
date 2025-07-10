import * as amqp from "amqplib/callback_api";
import config from "../config";
import { Logger } from "../utils/logger";
import { NotificationMessage } from "../interfaces/notification.interface";

export class QueueService {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly logger: Logger) {}

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      amqp.connect(config.rabbitMQ.url, (err, conn) => {
        if (err) {
          this.logger.error("Failed to connect to RabbitMQ", err);
          return console.log("what");
          return reject(err);
        }

        this.connection = conn;

        conn.createChannel((err, ch) => {
          if (err) {
            this.logger.error("Failed to create channel", err);
            return reject(err);
          }

          this.channel = ch;

          this.channel.assertQueue(
            config.rabbitMQ.queue,
            { durable: true },
            (err) => {
              if (err) return reject(err);

              this.logger.info("Connected to RabbitMQ");
              resolve();
            }
          );
        });
      });
    });
  }

  async consume(
    callback: (msg: NotificationMessage) => Promise<boolean>
  ): Promise<void> {
    if (!this.channel) throw new Error("Channel not initialized");

    this.channel.consume(
      config.rabbitMQ.queue,
      async (msg: amqp.Message | null) => {
        if (!msg) return;

        try {
          const content = JSON.parse(
            msg.content.toString()
          ) as NotificationMessage;

          this.logger.info("Processing notification", {
            notificationId: content.notification_id,
          });

          const success = await callback(content);

          if (success) {
            this.channel!.ack(msg);
            this.logger.info("Notification processed successfully", {
              notificationId: content.notification_id,
            });
          } else {
            this.logger.warn("Notification processing failed, discarding", {
              notificationId: content.notification_id,
            });
            this.channel!.nack(msg, false, false); // Do not requeue
          }
        } catch (error) {
          this.logger.error("Error processing message", error);
          this.channel!.nack(msg, false, false); // Do not requeue
        }
      },
      { noAck: false }
    );
  }

  async close(): Promise<void> {
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

      const handleError = (err: any) => {
        this.logger.error("Error closing RabbitMQ connection", err);
        reject(err);
      };

      if (this.channel) {
        this.channel.close((err) => (err ? handleError(err) : checkDone()));
      } else {
        checkDone();
      }

      if (this.connection) {
        this.connection.close((err) => (err ? handleError(err) : checkDone()));
      } else {
        checkDone();
      }
    });
  }
}