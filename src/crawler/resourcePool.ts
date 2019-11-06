import genericPool from "generic-pool";
import uuid from "uuid";

import { Context } from "./crawler";
import { ResourceQueue, TaskWorker } from "./types";

type ResourcePoolContext = Pick<Context, "config">;

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
  private hasOutstandingTasks: boolean;

  constructor(
    ctx: ResourcePoolContext,
    private queue: ResourceQueue,
    private taskWorker: TaskWorker
  ) {
    this.hasOutstandingTasks = false;
    this.maxConnections = ctx.config.resourcePool.maxConnections;
    const factory = {
      // generic-pool expects a factory with this function signature (https://github.com/coopernurse/node-pool)
      create: async () => generateIdentifiableResource(this.queue),
      destroy: async () => {
        console.log("pool connection destroyed");
      }
    };
    const opts: genericPool.Options = {
      max: this.maxConnections
    };
    this.pool = genericPool.createPool(factory, opts);
  }

  /**
   * Start begins the task pool tasks.
   * It will continuously loop until the pool is finished.
   * When pool is finished it will close the pool.
   */
  async startTasks() {
    while (!this.isPoolFinished()) {
      if (this.shouldAddNewWorker()) {
        this.addWorker();
        continue;
      }
      await this.waitUntilResourceAvailable(); // stops from endlessly looping when no resources are available
    }
    await this.closePool();
  }

  /**
   * checks if pool is finished! This means that there is nothing left in the queue
   * and all workers have completed their tasks :D
   */
  private isPoolFinished() {
    const nothingInQueue = this.queue.count() === 0;
    return nothingInQueue && !this.hasOutstandingTasks;
  }

  /**
   * Adds a task worker. Acquires a connection to resource and does not
   * release it until the task worker's work is completed
   * locks the pool from finishing while a worker is executing.
   */
  private async addWorker() {
    this.lockPoolFromFinishing();

    const resource = await this.pool.acquire();
    const nextInQueue = resource.queue.getNext();
    await this.taskWorker.work(nextInQueue);
    await this.releaseResource(resource); // decide how to handle errs in releasing connection
    this.unlockPoolFromFinishing();
  }

  /** when there are no connections availalbe, this func waits to aquire one then immedietly releases it */
  private async waitUntilResourceAvailable() {
    const resource = await this.pool.acquire();
    await this.releaseResource(resource);
  }

  private async releaseResource(resource: IdentifiableResource) {
    await this.pool.release(resource);
  }

  private async closePool() {
    await this.pool.drain();
    await this.pool.clear();
  }

  private lockPoolFromFinishing() {
    this.hasOutstandingTasks = true;
  }

  private unlockPoolFromFinishing() {
    this.hasOutstandingTasks = false;
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
