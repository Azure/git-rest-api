import convict from "convict";

import { Configuration } from "./configuration";

export const configSchema = convict<Configuration>({
  nodeEnv: {
    doc: "The application environment.",
    format: ["production", "development", "test"],
    default: "development",
    env: "NODE_ENV",
  },
  env: {
    doc: "Custom environment name for where the service is deployed. This is what will be used to log",
    format: String,
    default: "development",
    env: "APP_ENV",
  },
  serviceName: {
    doc: "Name of the service. Used when uploading metrics for example",
    format: String,
    default: "git-rest-api",
    env: "serviceName",
  },
  statsd: {
    host: {
      doc: "Statsd host to upload metrics using statsd",
      format: String,
      default: undefined,
      env: "statsd_host",
    },
    port: {
      doc: "Statsd port to upload metrics using statsd",
      format: Number,
      default: undefined,
      env: "statsd_port",
    },
  },
});
