import { expect } from "chai";
import { createRequester } from "../requester";

describe("Requester client", () => {
  it("creates a requester client with a get function", () => {
    const requester = createRequester();
    expect(typeof requester.get).to.equal("function");
  });

  it("will make a get request given a url", async () => {
    const requester = createRequester();
    const response = await requester.get("https://google.com");
    expect(response).to.have.property("data");
  });
});
