import { LoggerService } from "@nestjs/common";
import winston from "winston";

import { WINSTON_LOGGER } from "./winston-logger";

/**
 * Class to handle logs from nest.
 * This shouldn't be used directly this is just to route nest logs to winston
 */
export class NestLogger implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = WINSTON_LOGGER;
  }

  public log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  public error(message: string, trace?: string, context?: string) {
    this.logger.error(message, {
      trace,
      context,
    });
  }

  public warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  public debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  public verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }
}
