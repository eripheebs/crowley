import { Requester } from "./requester";

/**
 * Clients to be injected into the crawler context.
 * This way, you can inject your own configuration if you want to use different defaults for e.g. the requester.
 * Here is where I might add a logger.
 */
export interface Clients {
  requester: Requester;
}
