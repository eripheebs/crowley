import { Requester } from "./requester";
import { Logger } from "./logger";

/**
 * Clients to be injected into the crawler context.
 * This way, you can inject your own configuration if you want to use different defaults for e.g. the requester.
 */
export interface Clients {
  requester: Requester;
  logger: Logger;
}
