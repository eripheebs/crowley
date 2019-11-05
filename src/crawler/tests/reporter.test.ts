import { expect } from "chai";
import fs from "fs";
import rimraf from "rimraf";
import { addUrlToOutputFile } from "../reporter";
import { createConfig } from "../../config/config";
import { generateContext } from "./context.fixtures";

describe("addUrlToOutputFile", () => {
  const filePath = "test-file.txt";
  const config = createConfig({
    reporter: {
      outputFilePath: filePath
    }
  });
  const context = generateContext({
    config: config
  });

  beforeEach(() => {
    // create temporary test files
    fs.writeFileSync(filePath, "");
  });

  afterEach(() => {
    // delete temporary test files
    rimraf.sync(filePath);
  });

  it("should add url to test file", async () => {
    const testUrl = "https://google.com";
    await addUrlToOutputFile(context, testUrl);
    const fileContext = fs.readFileSync(filePath, { encoding: "utf8" });
    expect(fileContext).to.equal(`${testUrl}\n`);
  });

  it("should add url to test file with a new line per url", async () => {
    const testUrl = "https://cats.com";
    const anotherTestUrl = "https://dogs.com";
    await addUrlToOutputFile(context, testUrl);
    await addUrlToOutputFile(context, anotherTestUrl);
    const fileContext = fs.readFileSync(filePath, { encoding: "utf8" });
    expect(fileContext).to.equal("https://cats.com\nhttps://dogs.com\n");
  });
});
