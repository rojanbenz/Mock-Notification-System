import { FastifyBaseLogger } from 'fastify';

export class Logger {
  constructor(private readonly logger: FastifyBaseLogger) {}

  info(message: string, data?: any) {
    this.logger.info({ msg: message, data });
  }

  error(message: string, error?: any) {
    this.logger.error({ msg: message, error });
  }

  warn(message: string, data?: any) {
    this.logger.warn({ msg: message, data });
  }
}