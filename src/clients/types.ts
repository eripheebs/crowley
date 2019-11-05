import { Requester } from "./requester";
import { HTMLParser } from "./HTMLParser";

/**
 * External clients to be injected into the crawler context.
 * here is where I might add a logger.
 */
export interface Clients {
  requester: Requester;
  htmlParser: HTMLParser;
}
