import { Metric, Telemetry } from "./telemetry";

export class NoopTelemetry extends Telemetry {
  protected egressMetric(_: Metric): void {
    // Noop
  }
}
