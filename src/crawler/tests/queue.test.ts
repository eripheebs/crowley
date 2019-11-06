import { expect } from "chai";
import { createUrlQueue, UrlQueue } from "../queue";
import { URL } from "url";
import { createConfig } from "../../config/config";
import { generateContext } from "./context.fixtures";

describe("UrlQueue", () => {
  let urlQueue: UrlQueue;
  const aUrl = new URL("http://www.blah.com");
  const anotherUrl = new URL("http://www.hippo.com/hippos");
  const config = createConfig({
    crawler: {
      initialUrl: aUrl
    }
  });
  const context = generateContext({
    config
  });
  beforeEach(() => {
    urlQueue = createUrlQueue(context);
  });

  describe("getNext", () => {
    it("gets the next in the queue", async () => {
      const actual = urlQueue.getNext();
      expect(actual).to.equal(aUrl);
    });

    it("errors if there is nothing left in the queue", async () => {
      urlQueue.getNext();
      try {
        urlQueue.getNext();
        expect.fail();
      } catch (err) {
        expect(err.message).to.equal("no more in queue!");
      }
    });
  });

  describe("addToQueue", () => {
    it("adds url to queue that you can then request", async () => {
      urlQueue.addToQueue(anotherUrl);
      const actual = urlQueue.testing.urls;
      expect(actual).to.deep.equal([aUrl, anotherUrl]);
    });

    it("doesnt add urls that you have seen before", async () => {
      urlQueue.addToQueue(anotherUrl);
      urlQueue.addToQueue(anotherUrl);
      const actual = urlQueue.testing.urls;
      expect(actual).to.deep.equal([aUrl, anotherUrl]);
    });
  });

  describe("count", () => {
    it("returns number in urls", async () => {
      expect(urlQueue.count()).to.equal(1);
    });

    it("returns number in urls - test length more than 1", async () => {
      urlQueue.addToQueue(anotherUrl);
      expect(urlQueue.count()).to.equal(2);
    });

    it("returns number in urls - test empty", async () => {
      urlQueue.getNext();
      expect(urlQueue.count()).to.equal(0);
    });
  });
});
