/**
 * Generic resource queue interface, for the ResourcePool
 */
export interface ResourceQueue {
  addItemsToQueue: (resource: any[]) => void;
  getNext: () => any;
  count: () => number;
}

/**
 * Generic task worker interface, for the ResourcePool
 */
export interface TaskWorker {
  work: (resource: any) => Promise<void>;
}
