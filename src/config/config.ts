import { Config } from "./types";

const defaultConfig: Config = {
  maxConnections: 4
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
