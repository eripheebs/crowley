var TypedError = require("error/typed");
// Error/typed does not have typings, unfortunately.

export const EmptyQueueError = TypedError({
  type: "queue.emptyQueue",
  message: "Attempted to get next from empty queue"
});
