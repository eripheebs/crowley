import { Clients } from "../clients/types";
import { Config } from "../config/types";

/**
 * Context with injected dependencies that will be passed down to sub modules.
 * clients, config atm
 */
export interface Context {
  clients: Clients;
  config: Config;
}

export class Crawler {
  constructor(private clients: Clients, private config: Config) {}

  /**
   * worker stuff goes here....?
   */
  async crawl() {
    this.clients.requester;
  }
}

export function createCrawler(ctx: Context) {
  return new Crawler(ctx);
}
