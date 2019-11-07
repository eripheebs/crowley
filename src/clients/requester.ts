import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

export type Requester = Pick<AxiosInstance, "get">;

/**
 * This is the default requester. You can pass any default core options you want here.
 * TODO: add no-op requester.
 */
export function createRequester(defaults: AxiosRequestConfig = {}): Requester {
  return axios.create(defaults);
}
