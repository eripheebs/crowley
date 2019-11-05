import request from "request";

export type Requester = Pick<
  request.RequestAPI<
    request.Request,
    request.CoreOptions,
    request.RequiredUriUrl
  >,
  "get"
>;

/**
 * This is the default requester object. You can pass any default core options you want here.
 * TODO: add no-op client.
 */
export function createRequester(defaults: request.CoreOptions): Requester {
  return request.defaults(defaults);
}
