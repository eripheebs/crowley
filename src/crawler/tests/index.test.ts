import { URL } from "url";
import { AxiosRequestConfig } from "axios";
import { expect } from "chai";
import sinon from "sinon";
import rimraf from "rimraf";
import fs from "fs";

import { createCrawler, Crawler } from "../index";
import { createConfig } from "../../config";
import { createUrlQueue, UrlQueue } from "../queue";
import { createClients } from "../../clients";
import { someHTML } from "./html.fixture";

describe("Crawler", () => {
  let crawler: Crawler,
    sandbox: sinon.SinonSandbox,
    requesterStub: sinon.SinonStub<[string, (AxiosRequestConfig | undefined)?]>;

  const initialUrl = new URL("http://worldflagsgraded.com");
  const initialUrlAsString = initialUrl.origin;

  const outputFilePath = "temp-test-file.txt";
  const pollIntervalMs = 200;

  const clients = createClients();
  const config = createConfig({
    outputFilePath,
    initialUrl,
    maxTimeoutMs: 2000,
    pollIntervalMs
  });
  const context = {
    config,
    clients
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    crawler = createCrawler(context);
    requesterStub = sandbox.stub(clients.requester, "get");
  });

  afterEach(() => {
    sandbox.restore();
    rimraf.sync(outputFilePath);
  });

  describe("work", () => {
    let queue: UrlQueue;
    beforeEach(() => {
      queue = createUrlQueue(context);
    });

    describe("happy path", () => {
      beforeEach(() => {
        requesterStub.resolves({
          data: someHTML
        });
      });

      it("adds the next url in the queue to the output file", async () => {
        await crawler.work(queue);
        const fileContent = fs.readFileSync(outputFilePath, {
          encoding: "utf8"
        });
        expect(fileContent).to.equal(`${initialUrl}\n`);
      });

      it("makes a get request to the next url", async () => {
        await crawler.work(queue);
        expect(requesterStub.calledWith(initialUrl.toString()));
      });

      it("removes next url from the queue", async () => {
        await crawler.work(queue);
        expect(queue.getNext()).not.to.equal(initialUrl);
      });

      it("adds urls it finds in the response body", async () => {
        await crawler.work(queue);
        expect(queue.count()).to.equal(4);
      });
    });

    it("should return early and add no more urls if the get request returns non-HTML data", async () => {
      requesterStub.resolves({
        data: {
          this: "isNotAString"
        }
      });
      await crawler.work(queue);
      expect(queue.count()).to.equal(0);
    });
  });

  describe("beginCrawl", () => {
    describe("happy path", () => {
      const path1 = "/hungry";
      const path2 = "/i/am";

      beforeEach(() => {
        requesterStub.resolves({
          data: `<html><a href="${path1}"></a><html><a href="${path2}"></html>`
        });
      });

      it("adds the next url in the queue to the output file", async () => {
        await crawler.beginCrawl();
        const fileContent = fs.readFileSync(outputFilePath, {
          encoding: "utf8"
        });
        const fileContentUrlsAsArray = fileContent.split(/\n/);
        expect(fileContentUrlsAsArray).to.contain(`${initialUrlAsString}/`);
      });

      it("makes a get request for every new url", async () => {
        await crawler.beginCrawl();
        expect(requesterStub.getCalls().length).to.equal(3);
      });

      it("only makes a get request to a url once even if it appears in another page again", async () => {
        await crawler.beginCrawl();
        expect(
          requesterStub.calledOnceWithExactly(`${initialUrlAsString}${path1}`)
        );
      });
    });

    it("should timeout based on the max timeout provided in the config", async () => {
      requesterStub.resolves({
        data: `<html><a href="/test123"></a>`
      });
      const config2 = createConfig({
        outputFilePath,
        initialUrl,
        maxTimeoutMs: 1,
        pollIntervalMs: 1
      });
      const context = {
        config: config2,
        clients
      };
      const timeoutCrawler = createCrawler(context);
      try {
        await timeoutCrawler.beginCrawl();
        expect.fail();
      } catch (err) {
        expect(err.message).to.equal("pool is draining and cannot accept work");
        expect(requesterStub.called).to.be.false;
      }
    });
  });
});
