import genericPool from "generic-pool";
import uuid from "uuid";
import delay from "delay";

import { Context } from "./index";
import { ResourceQueue, TaskWorker } from "./types";

type ResourcePoolContext = Pick<Context, "config" | "clients">;

interface IdentifiableResource {
  id: string;
  queue: ResourceQueue;
}

/** add ID so that generic-pool can identify which connections to the resource are being used / available */
const generateIdentifiableResource = (
  queue: ResourceQueue
): IdentifiableResource => ({
  id: uuid.v4(),
  queue
});

/**
 * Resource pool
 * A resource pool that control access to a queue.
 * The pool will allow acquiring [maxConnections] to the queue,
 * The workers can then do whatever they want to that resource (making this interface generic).
 * The pool will not release the connection to the resource until the worker promise is resolved.
 */

export class ResourcePool {
  private pool: genericPool.Pool<IdentifiableResource>;
  private maxConnections: number;
  private oustandingTasks: number;
  testing: {
    // exporting just for testing
    pool: genericPool.Pool<any>;
  };

  constructor(
    private ctx: ResourcePoolContext,
    private queue: ResourceQueue,
    private taskWorker: TaskWorker
  ) {
    this.oustandingTasks = 0;
    this.maxConnections = ctx.config.resourcePool.maxConnections;
    const factory = {
      // generic-pool expects a factory in it's createPool function signature (https://github.com/coopernurse/node-pool)
      create: async () => generateIdentifiableResource(this.queue),
      destroy: async () => {
        this.ctx.clients.logger.info("pool connection destroyed");
      }
    };
    const opts: genericPool.Options = {
      max: this.maxConnections
    };
    this.pool = genericPool.createPool(factory, opts);

    this.testing = {
      pool: this.pool
    };
  }

  /**
   * Start tasks begins allocating resources to workers to perform tasks on.
   * It will continuously loop until the pool is finished.
   * When pool is finished it will close the pool.
   */
  startTasks = async () => {
    while (!this.isPoolFinished()) {
      if (this.shouldAddNewWorker()) {
        this.addWorker();
        this.ctx.clients.logger.info("worker added");
        continue;
      }
      await this.waitUntilResourceAvailable(); // stops from endlessly looping when no resources are available
    }
    await this.closePool();
  }

  closePool = async () => {
    await this.pool.drain();
    await this.pool.clear();
    this.ctx.clients.logger.info("pool drained");
  };

  /**
   * checks if pool is finished! This means that there is nothing left in the queue
   * and all workers have completed their tasks :D
   */
  private isPoolFinished() {
    const nothingInQueue = this.queue.count() === 0;
    return nothingInQueue && !this.oustandingTasks;
  }

  /**
   * Adds a task worker. Acquires a connection to resource and does not
   * release it until the task worker's work is completed
   * locks the pool from finishing while a worker is executing.
   */
  private async addWorker() {
    this.addOutstandingTaskCount();

    const resource = await this.pool.acquire();
    try {
      await this.taskWorker.work(resource.queue);
    } catch (err) {
      this.ctx.clients.logger.error("task worker failed");
    }
    await this.releaseResource(resource); // decide how to handle errs in releasing connection
    this.subtractOutstandingTaskCount();
  }

  /** when there are no connections availalbe, this func waits for a delay, then waits to aquire a connection then immedietly releases it */
  private async waitUntilResourceAvailable() {
    await delay(this.ctx.config.crawler.pollIntervalMs);
    const resource = await this.pool.acquire();
    await this.releaseResource(resource);
  }

  private async releaseResource(resource: IdentifiableResource) {
    await this.pool.release(resource);
  }

  private addOutstandingTaskCount() {
    this.oustandingTasks += 1;
  }

  private subtractOutstandingTaskCount() {
    this.oustandingTasks -= 1;
  }

  /**
   * if there is spare resource capacity or available connections, add new worker
   * if there is nothing in the queue, don't add new worker
   */
  private shouldAddNewWorker(): boolean {
    if (this.queue.count() === 0) {
      return false;
    }
    return this.pool.spareResourceCapacity != 0 || this.pool.available != 0;
  }
}

export function createResourcePool(
  ctx: ResourcePoolContext,
  queue: ResourceQueue,
  taskWorker: TaskWorker
) {
  return new ResourcePool(ctx, queue, taskWorker);
}
