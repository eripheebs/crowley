import { URL } from "url";
import { Context } from "./crawler";

type URLQueueContext = Pick<Context, "config">;

/**
 * The queue keeps the URLs that have yet to be visited.
 * It also keeps an index of all the urls that have already been visited, so that we don't explore them again.
 */

export class UrlQueue {
  private urls: URL[];
  private visited: Record<string, boolean>;
  testing: {
    // keys exposed only for testing
    urls: URL[];
  };

  constructor(ctx: URLQueueContext) {
    const initialUrl = ctx.config.crawler.initialUrl;
    this.urls = [initialUrl];
    this.visited = {};
    this.testing = {
      urls: this.urls
    };
  }

  addToQueue(url: URL) {
    if (this.isSeen(url)) {
      return;
    }
    this.urls.push(url);
    this.addToVisited(url);
  }

  getNext(): URL {
    if (this.urls.length === 0) {
      throw Error("no more in queue!"); // make typed err later
    }
    return this.urls.shift() as URL; // this should be able to infer - fix later
  }

  private addToVisited(url: URL) {
    this.visited[url.toString()] = true;
  }

  private isSeen(url: URL): boolean {
    return Boolean(this.visited[url.toString()]);
  }
}

export function createUrlQueue(ctx: URLQueueContext) {
  return new UrlQueue(ctx);
}
