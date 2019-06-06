import { Configuration } from "../../config";
import { NoopTelemetry } from "./noop-telemetry";
import { StatsdTelemetry } from "./statsd-telemetry";
import { Telemetry } from "./telemetry";

export function createTelemetry(config: Configuration): Telemetry {
  {
    if (config.statsd.host && config.statsd.port) {
      return new StatsdTelemetry(config);
    } else {
      return new NoopTelemetry();
    }
  }
}
