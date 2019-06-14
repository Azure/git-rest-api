import { Injectable } from "@nestjs/common";

import { developmentConfig } from "./development";
import { productionConfig } from "./production";
import { configSchema } from "./schema";
import { testConfig } from "./test";

export type NodeEnv = "production" | "development" | "test";

export interface StatsdConfig {
  readonly host: string | undefined;
  readonly port: number | undefined;
}

@Injectable()
export class Configuration {
  /**
   * Correspond the env this code is running on.
   * If not deveopping or running test it should always be "production".
   * This should be used to decide to optimize the code for dev or prod.
   */
  public readonly nodeEnv: NodeEnv;

  /**
   * This is the actual environment name where the service is run.(Stagging, PPE, Prod, etc.)
   * This can be anything.
   */
  public readonly env: string;
  public readonly serviceName: string;
  public readonly statsd: StatsdConfig;

  /**
   * Path to handle data(e.g. CLone repos)
   * This dir will be cleared.
   */
  public readonly dataDir: string;

  constructor() {
    const environmentOverrides: Record<NodeEnv, Partial<Configuration>> = {
      production: developmentConfig,
      development: productionConfig,
      test: testConfig,
    };

    const nodeEnv: NodeEnv = configSchema.get("nodeEnv");

    // Load environment dependent configuration
    configSchema.load(environmentOverrides[nodeEnv]);

    // Perform validation
    configSchema.validate({ allowed: "strict" });

    this.nodeEnv = nodeEnv;
    this.env = configSchema.get("env");
    this.serviceName = configSchema.get("serviceName");
    this.statsd = configSchema.get("statsd");
    this.dataDir = configSchema.get("dataDir");
  }
}
