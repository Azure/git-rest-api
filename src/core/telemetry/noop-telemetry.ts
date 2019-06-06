import { Metric, Telemetry } from "./telemetry";

export class NoopTelemetry extends Telemetry {
  public emitMetric(_: Metric): void {
    // Noop
  }
}
