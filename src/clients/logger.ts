export interface Logger {
  info: (message: any) => void;
  error: (message: any) => void;
}

/**
 * This is the default logger. I'm just making it console log for now.
 * This is where I'd hook it up with whatever logging service we might use,
 * and have different config for development, prod, testing etc.
 */
export function createLogger(): Logger {
  return {
    info: (message: any) => console.log(message),
    error: (message: any) => console.log(message)
  };
}
