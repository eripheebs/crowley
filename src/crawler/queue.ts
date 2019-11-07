import { URL } from "url";
import { Context } from "./index";
import { ResourceQueue } from "./types";
import { EmptyQueueError } from "./errors";

type URLQueueContext = Pick<Context, "config" | "clients">;

/**
 * The queue keeps the URLs that have yet to be visited.
 * It also keeps an index of all the urls that have already been visited, so that we don't explore them again.
 */

export class UrlQueue implements ResourceQueue {
  private urls: URL[];
  private visited: Record<string, boolean>;
  testing: {
    // keys exposed only for testing
    urls: URL[];
  };

  constructor(private ctx: URLQueueContext) {
    const initialUrl = ctx.config.crawler.initialUrl;
    this.urls = [initialUrl];
    this.visited = {
      [initialUrl.toString()]: true
    };
    this.testing = {
      urls: this.urls
    };
  }

  addItemsToQueue(urls: URL[]) {
    urls.forEach(this.addToQueue);
  }

  getNext(): URL {
    if (this.urls.length === 0) {
      throw EmptyQueueError();
    }
    return this.urls.shift() as URL; // this should be able to infer - fix later
  }

  count(): number {
    return this.urls.length;
  }

  private addToQueue = (url: URL) => {
    if (this.isSeen(url)) {
      this.ctx.clients.logger.info(`${url.toString()} already seen`);
      return;
    }
    this.urls.push(url);
    this.addToVisited(url);
    this.ctx.clients.logger.info(`${url.toString()} added to queue`);
  };

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
