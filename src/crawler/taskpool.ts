import genericPool from "generic-pool";

import { Context } from "./crawler";
import { UrlQueue } from "./queue";

type TaskPoolContext = Pick<Context, "config">;

/**
 * Task pool
 */

export class TaskPool {
  constructor(ctx: TaskPoolContext) {
    const factory = {
      // generic-pool expects a factory
      create: function() {
        return;
      },
      destroy: function(client) {
        client.disconnect();
      }
    };
  }
}

export function createTaskPool(ctx: TaskPoolContext, queue: UrlQueue) {
  return new TaskPool(ctx, queue);
}
