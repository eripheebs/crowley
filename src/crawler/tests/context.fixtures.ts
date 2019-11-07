import { createRequester } from "../../clients/requester";
import { URL } from "url";

import { Context } from "../index";

const initialUrl = new URL("https://google.com");

const defaultConfig: Context = {
  clients: {
    requester: createRequester(),
    logger: {
      info: () => {},
      error: () => {}
    }
  },
  config: {
    crawler: {
      initialUrl,
      maxTimeoutMs: 100000,
      pollIntervalMs: 1000
    },
    reporter: {
      outputFilePath: "sitemap.txt"
    },
    resourcePool: {
      maxConnections: 4
    }
  }
};

/**
 * Creates config, with overrides
 */
export function generateContext(overrides: Partial<Context> = {}): Context {
  return {
    ...defaultConfig,
    ...overrides
  };
}
