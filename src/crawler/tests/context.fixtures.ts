import request from "request";
import { URL } from "url";

import { Context } from "../crawler";

const initialUrl = new URL("https://google.com");

const defaultConfig: Context = {
  clients: {
    requester: request.defaults({})
  },
  config: {
    crawler: {
      initialUrl
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
