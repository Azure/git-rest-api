import { StatsD } from "hot-shots";

import { Configuration } from "../../config";
import { Metric, Telemetry } from "./telemetry";

export class StatsdTelemetry extends Telemetry {
  private instance: StatsD;

  constructor(private config: Configuration) {
    super();
    const { host, port } = this.config.statsd;
    this.instance = new StatsD({ host, port });
  }

  public emitMetric(metric: Metric): void {
    const stat = JSON.stringify({
      Metric: metric,
      Namespace: this.config.serviceName,
      Dims: {
        ...metric.dimensions,
        env: this.config.env,
      },
    });

    this.instance.gauge(stat, metric.value);
  }
}
