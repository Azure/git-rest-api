import { Injectable } from "@nestjs/common";

import { developmentConfig } from "./development";
import { productionConfig } from "./production";
import { configSchema } from "./schema";
import { testConfig } from "./test";

export type Env = "production" | "development" | "test";

@Injectable()
export class Configuration {
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

    this.env = configSchema.get("env");
  }

  public readonly env: Env;
}
