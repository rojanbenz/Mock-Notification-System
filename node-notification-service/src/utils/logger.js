"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(logger) {
        this.logger = logger;
    }
    info(message, data) {
        this.logger.info({ msg: message, data });
    }
    error(message, error) {
        this.logger.error({ msg: message, error });
    }
    warn(message, data) {
        this.logger.warn({ msg: message, data });
    }
}
exports.Logger = Logger;
