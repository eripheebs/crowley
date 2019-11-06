/**
 * Generic resource queue interface
 */
export interface ResourceQueue {
  addToQueue: (resource: any) => void;
  getNext: () => any;
  count: () => number;
}

export interface TaskWorker {
  work: (resource: any) => Promise<void>;
}
