import "dotenv/config";
import { URL } from "url";

import { createCrawler } from "./crawler";
import { createClients } from "./clients";
import { createConfig } from "./config";

const initialUrl: string | undefined = process.env.INITIAL_URL;
const maxTimeoutMs: string | undefined = process.env.MAX_TIMEOUT_MS;
const maxConnections: string | undefined = process.env.MAX_CONNECTIONS;
const pollIntervalMs: string | undefined = process.env.POLL_INTERVAL_MS;

// TODO: be able to pass client config as well
const clients = createClients();

const config = createConfig({
  initialUrl: Boolean(initialUrl) ? new URL(initialUrl!) : undefined, // type being weird here - should infer from the boolean check it's not undefined
  maxTimeoutMs: Boolean(maxTimeoutMs) ? Number(maxTimeoutMs) : undefined,
  outputFilePath: process.env.OUTPUT_FILE_PATH,
  maxConnections: Boolean(maxConnections) ? Number(maxConnections) : undefined,
  pollIntervalMs: Boolean(pollIntervalMs) ? Number(pollIntervalMs) : undefined
});

const crawler = createCrawler({
  config,
  clients
});

(async () => {
  await crawler.beginCrawl();
  process.exit();
})();
