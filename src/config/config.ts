import { Config } from "./types";

const defaultConfig: Config = {
  reporter: {
    outputFilePath: "sitemap.txt"
  }
};

/**
 * Creates config, with overrides
 */
export function createConfig(overrides: Partial<Config>): Config {
  return {
    ...defaultConfig,
    ...overrides
  };
}
