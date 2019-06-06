export interface Metric {
  name: string;
  value: number;
  dimensions?: StringMap<string>;
}

export abstract class Telemetry {
  public abstract emitMetric(metric: Metric): void;
}
