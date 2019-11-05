import { createRequester } from "../requester";
import { expect } from "chai";

describe("Requester client", () => {
  it("creates a requester client with a get function", () => {
    const requester = createRequester({});
    expect(typeof requester.get).to.equal("function");
  });
});
