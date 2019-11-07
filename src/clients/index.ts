import { Clients } from "./types";
import { createRequester } from "./requester";
import { createLogger } from "./logger";

// TODO: pass options through here
export function createClients(): Clients {
  const requester = createRequester();
  const logger = createLogger();
  return {
    requester,
    logger
  };
}
