import chalk from "chalk";
import jsonStringify from "fast-safe-stringify";
import { MESSAGE } from "triple-beam";
import winston, { LoggerOptions, format } from "winston";
import winstonDailyFile from "winston-daily-rotate-file";

import { Configuration } from "../../config";
import { getContext } from "../context";

// Adds default metadata to logs
const addProdMetadata = winston.format(info => {
  info.Env = config.env;
  info.Service = config.serviceName;
  if (!info.requestId) {
    info.requestId = getContext("requestId");
  }
  return info;
});

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

// In development only we want to have the logs printed nicely. For production we want json log lines that can be parsed easily
if (config.nodeEnv === "development") {
  consoleTransport.format = winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.colorize(),
    customFormat(),
  );
} else {
  consoleTransport.format = winston.format.combine(
    addProdMetadata(),
    winston.format.timestamp(),
    winston.format.json(),
  );
}

const transports: any[] = [new winston.transports.Console(consoleTransport)];

if (config.nodeEnv === "test") {
  consoleTransport.silent = true;
} else {
  transports.push(
    new winstonDailyFile({
      filename: `%DATE%.log`,
      datePattern: "YYYY-MM-DD-HH",
      level: "debug",
      dirname: "logs",
      handleExceptions: true,
    }),
  );
}

export const WINSTON_LOGGER_OPTIONS: LoggerOptions = {
  transports,
};

/**
 * DO NOT import this one directly
 */
export const WINSTON_LOGGER = winston.createLogger(WINSTON_LOGGER_OPTIONS);
