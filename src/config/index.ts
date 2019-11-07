import { Config } from "./types";
import { URL } from "url";

interface ConfigInput {
  initialUrl?: URL;
  maxTimeoutMs?: number;
  outputFilePath?: string;
  maxConnections?: number;
  pollIntervalMs?: number;
}

const defaultConfig: Config = {
  crawler: {
    initialUrl: new URL("https://monzo.com/"),
    maxTimeoutMs: 100000,
    pollIntervalMs: 1000
  },
  reporter: {
    outputFilePath: "sitemap.txt"
  },
  resourcePool: {
    maxConnections: 4
  }
};

/**
 * Creates config, with overrides
 */
export function createConfig(overrides: ConfigInput = {}): Config {
  return {
    crawler: {
      initialUrl: overrides.initialUrl || defaultConfig.crawler.initialUrl,
      maxTimeoutMs:
        overrides.maxTimeoutMs || defaultConfig.crawler.maxTimeoutMs,
      pollIntervalMs:
        overrides.pollIntervalMs || defaultConfig.crawler.pollIntervalMs
    },
    reporter: {
      outputFilePath:
        overrides.outputFilePath || defaultConfig.reporter.outputFilePath
    },
    resourcePool: {
      maxConnections:
        overrides.maxConnections || defaultConfig.resourcePool.maxConnections
    }
  };
}
