import request from "request";
import { URL } from "url";

import { Context } from "../crawler";
import { createUrlQueue } from "../queue";

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
    }
  },
  urlQueue: createUrlQueue(initialUrl)
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
