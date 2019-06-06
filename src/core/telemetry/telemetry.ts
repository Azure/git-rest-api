export interface Metric {
  name: string;
  value: number;
  dimensions: StringMap<unknown>;
}

export abstract class Telemetry {
  protected abstract egressMetric(metric: Metric): void;
}
