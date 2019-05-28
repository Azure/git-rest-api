import chalk from "chalk";
// tslint:disable-next-line: no-implicit-dependencies
import jsonStringify from "fast-safe-stringify";
import { MESSAGE } from "triple-beam";
import winston, { LoggerOptions, format } from "winston";
import winstonDailyFile from "winston-daily-rotate-file";

import { Configuration } from "../../config";

const consoleTransport: winston.transports.ConsoleTransportOptions = {
  handleExceptions: true,
  level: "info",
};

const customFormat = format(info => {
  const { message, level, timestamp, context, trace, ...others } = info;
  const stringifiedRest = jsonStringify(others);

  const padding = (info.padding && info.padding[level]) || "";
  const coloredTime = chalk.dim.yellow.bold(timestamp);
  const coloredContext = chalk.grey(context);
  let coloredMessage = `${level}:${padding} ${coloredTime} | [${coloredContext}] ${message}`;
  if (stringifiedRest !== "{}") {
    coloredMessage = `${coloredMessage} ${stringifiedRest}`;
  }
  if (trace) {
    coloredMessage = `${coloredMessage}\n${trace}`;
  }
  info[MESSAGE] = coloredMessage;
  return info;
});

const config = new Configuration();
// Production depends on the default JSON serialized logs to be uploaded to Geneva.
if (config.env === "development") {
  consoleTransport.format = winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.colorize(),
    customFormat(),
  );
} else {
  consoleTransport.format = winston.format.combine(winston.format.timestamp(), winston.format.json());
}

export class LoggerService {
  public static loggerOptions: LoggerOptions = {
    transports: [
      new winston.transports.Console(consoleTransport),
      new winstonDailyFile({
        filename: `%DATE%.log`,
        datePattern: "YYYY-MM-DD-HH",
        level: "debug",
        dirname: "logs",
        handleExceptions: true,
      }),
    ],
  };

  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger(LoggerService.loggerOptions);
  }

  public log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  public error(message: string, trace: string) {
    this.logger.error(message, {
      trace,
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
