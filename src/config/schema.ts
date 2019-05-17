import convict from "convict";

import { Configuration } from "./configuration";

export const configSchema = convict<Configuration>({
  env: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV",
  },
});
