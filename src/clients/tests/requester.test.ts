import { expect } from "chai";
import { createRequester } from "../requester";

describe("Requester client", () => {
  it("creates a requester client with a get function", () => {
    const requester = createRequester({});
    expect(typeof requester.get).to.equal("function");
  });
});
