import delay from "delay";

import { Clients } from "../clients/types";
import { Config } from "../config/types";
import { createResourcePool, ResourcePool } from "./resourcePool";
import { createUrlQueue, UrlQueue } from "./queue";
import { parseHtmlAndCollectRelativeLinks, relativeLinkToUrl } from "./parser";
import { addUrlToOutputFile } from "./reporter";
import { EmptyQueueError } from "./errors";
import { URL } from "url";

/**
 * Context with injected dependencies that will be passed down to sub modules.
 * clients, config atm
 */
export interface Context {
  clients: Clients;
  config: Config;
}

export class Crawler {
  private resourcePool: ResourcePool | undefined;
  private urlQueue: UrlQueue;
  constructor(private ctx: Context) {
    this.urlQueue = createUrlQueue(ctx);
  }

  /**
   * Begin crawling!
   * Creates the resource pool with the queue and the task worker implements this.work.
   * In the future, we could pass an optional task worker into the crawler so it can be overriden.
   * A max timeout is set based on the maxTimeoutMs config value so.
   */
  beginCrawl = async () => {
    const taskWorker = {
      work: this.work
    };
    this.resourcePool = createResourcePool(this.ctx, this.urlQueue, taskWorker);

    setTimeout(
      this.resourcePool.closePool,
      this.ctx.config.crawler.maxTimeoutMs
    );

    await this.resourcePool.startTasks();
  };

  /**
   * work executes the task for the next url in the queue
   * It adds that url to the output file, then makes a request
   * to the url and checks for any relative links in it's response body.
   *
   * TODO: make work function retry if it errs. If it continues to fail pop the url somewhere for safekeeping.
   * TODO: handle max timeout met draining error gracefully.
   */
  work = async (queue: UrlQueue) => {
    let url: URL;
    try {
      url = queue.getNext();
    } catch (err) {
      if (err.type === EmptyQueueError.type) {
        this.ctx.clients.logger.info(
          "emtpy queue.. worker releasing resource back to the pool"
        );
        await delay(this.ctx.config.crawler.pollIntervalMs);
        return;
      }
      throw err;
    }

    await addUrlToOutputFile(this.ctx, url);

    const response = await this.ctx.clients.requester.get(url.toString());
    if (typeof response.data !== "string") {
      this.ctx.clients.logger.info(
        "resource is not a page that can be explored"
      );
      return;
    }

    const urls = this.getUrlsToAddFromResponse(response.data);
    queue.addItemsToQueue(urls);
  };

  private getUrlsToAddFromResponse(responseData: string): URL[] {
    const relativeLinks = parseHtmlAndCollectRelativeLinks(responseData);

    const urlOrigin = this.ctx.config.crawler.initialUrl.origin;

    return relativeLinks.map((link: string) =>
      relativeLinkToUrl({
        relativePath: link,
        baseUrl: urlOrigin
      })
    );
  }
}

export function createCrawler(ctx: Context) {
  return new Crawler(ctx);
}
