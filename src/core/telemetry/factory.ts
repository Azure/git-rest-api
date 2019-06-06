import { Configuration } from "../../config";
import { Logger } from "../logger";
import { NoopTelemetry } from "./noop-telemetry";
import { StatsdTelemetry } from "./statsd-telemetry";
import { Telemetry } from "./telemetry";

export function createTelemetry(config: Configuration): Telemetry {
  const logger = new Logger("TelemetryFactory");
  const instance = getTelmetryInstance(config);
  logger.info(`Resolving telemetry engine from configuration: ${instance.constructor.name}`);
  return instance;
}

function getTelmetryInstance(config: Configuration) {
  if (config.statsd.host && config.statsd.port) {
    return new StatsdTelemetry(config);
  } else {
    return new NoopTelemetry();
  }
}
