import { Config } from "./types";
import { URL } from "url";

const defaultConfig: Config = {
  crawler: {
    initialUrl: new URL("https://monzo.com/")
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
export function createConfig(overrides: Partial<Config> = {}): Config {
  return {
    ...defaultConfig,
    ...overrides
  };
}
