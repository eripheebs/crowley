// request
// .get('http://mysite.com/doodle.png')
import { Clients } from "../clients/types";
import { Config } from "../config/types";

type ClientDeps = Pick<Clients, "requester">;

/**
 * Context with all dependencies.
 * clients, config
 */
export interface Context {
  clients: Clients;
  config: Config;
}

export class Crawler {
  constructor(private clients: ClientDeps) {}

  /**
   * worker stuff goes here....?
   */
  async crawl() {
    this.clients.requester;
  }
}

export function createCrawler(ctx: Context) {
  return new Crawler(ctx.clients);
}
