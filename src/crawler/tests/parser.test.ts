import { expect } from "chai";
import { parseHtmlAndCollectRelativeLinks, relativeLinkToUrl } from "../parser";
import { someHTML } from "./html.fixture";

describe("parseHtmlAndCollectRelativeLinks", () => {
  it("parses html and collects all relative links", () => {
    const actual = parseHtmlAndCollectRelativeLinks(someHTML);
    const expected = [
      "/i/savingwithmonzo",
      "/features/savings",
      "/isa",
      "/blog/2019/05/17/how-to-save-money"
    ];

    expect(actual).to.deep.equal(expected);
  });

  it("handles unexpected request bodies gracefully", () => {
    // (the function expects valid HTML atm)
    // But nice to know it doesnt error when invalid html is passed!
    const badRequestBodies = [
      "<afhaoisdhfioadfs", // invalid HTML
      "{'not wat': 'you expected'}" // JSON
    ];

    badRequestBodies.map(async (reqBody: string) => {
      const actual = parseHtmlAndCollectRelativeLinks(reqBody);
      expect(actual).to.deep.equal([]);
    });
  });
});

describe("relativeLinkToUrl", () => {
  it("should turn a link and domain into a url", () => {
    const relativePath = "/blah";
    const baseUrl = "https://mahahah.com";
    const url = relativeLinkToUrl({ relativePath, baseUrl });
    expect(url.hostname).to.equal("mahahah.com");
    expect(url.pathname).to.equal("/blah");
  });

  it("should handle base url that has path", () => {
    const relativePath = "/blah";
    const baseUrl = "https://mahahah.com/asadfasfsasf";
    const url = relativeLinkToUrl({ relativePath, baseUrl });
    expect(url.hostname).to.equal("mahahah.com");
    expect(url.pathname).to.equal("/asadfasfsasf/blah");
  });
});
