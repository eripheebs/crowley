import request from "request";
import cheerio from "cheerio";

import { Context } from "../crawler";

const defaultConfig: Context = {
  clients: {
    requester: request.defaults({}),
    htmlParser: cheerio
  },
  config: {
    maxConnections: 4
  }
};

/**
 * Creates config, with overrides
 */
export function generateContext(overrides: Partial<Context>): Context {
  return {
    ...defaultConfig,
    ...overrides
  };
}
