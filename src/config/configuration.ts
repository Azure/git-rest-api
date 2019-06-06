import { Injectable } from "@nestjs/common";

import { developmentConfig } from "./development";
import { productionConfig } from "./production";
import { configSchema } from "./schema";
import { testConfig } from "./test";

export type Env = "production" | "development" | "test";

export interface StatsdConfig {
  readonly host: string | undefined;
  readonly port: number | undefined;
}

@Injectable()
export class Configuration {
  public readonly env: Env;
  public readonly serviceName: string;
  public readonly statsd: StatsdConfig;

  constructor() {
    const environmentOverrides: Record<Env, Partial<Configuration>> = {
      production: developmentConfig,
      development: productionConfig,
      test: testConfig,
    };

    const env: Env = configSchema.get("env");

    // Load environment dependent configuration
    configSchema.load(environmentOverrides[env]);

    // Perform validation
    configSchema.validate({ allowed: "strict" });

    this.env = env;
    this.serviceName = configSchema.get("serviceName");
    this.statsd = configSchema.get("statsd");
  }
}
