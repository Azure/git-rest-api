import winston from "winston";

import { WINSTON_LOGGER } from "./winston-logger";

export interface LogMetadata {
  context?: string;
  [key: string]: any;
}

export class Logger {
  private logger: winston.Logger;
  constructor(private context: string) {
    this.logger = WINSTON_LOGGER;
  }

  public info(message: string, meta?: LogMetadata) {
    this.logger.info(message, this.processMetadata(meta));
  }

  public debug(message: string, meta?: LogMetadata) {
    this.logger.debug(message, this.processMetadata(meta));
  }

  public warning(message: string, meta?: LogMetadata) {
    this.logger.warning(message, this.processMetadata(meta));
  }

  public error(message: string | Error, meta?: LogMetadata) {
    if (message instanceof Error) {
      this.logger.error(message.message, this.processMetadata({ ...meta, stack: message.stack }));
    } else {
      this.logger.error(message, this.processMetadata(meta));
    }
  }

  private processMetadata(meta: LogMetadata | undefined) {
    return {
      context: this.context,
      ...meta,
    };
  }
}
