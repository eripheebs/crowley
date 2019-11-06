import { expect } from "chai";
import fs from "fs";
import rimraf from "rimraf";
import { addUrlToOutputFile } from "../reporter";
import { createConfig } from "../../config/config";
import { generateContext } from "./context.fixtures";
import { URL } from "url";

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

  it("adds url to test file", async () => {
    const testUrl = new URL("https://google.com");
    await addUrlToOutputFile(context, testUrl);
    const fileContext = fs.readFileSync(filePath, { encoding: "utf8" });
    expect(fileContext).to.equal(`${testUrl}\n`);
  });

  it("adds url to test file with a new line per url", async () => {
    const testUrl = new URL("https://cats.com/cat");
    const anotherTestUrl = new URL("https://dogs.com/dog");
    await addUrlToOutputFile(context, testUrl);
    await addUrlToOutputFile(context, anotherTestUrl);
    const fileContext = fs.readFileSync(filePath, { encoding: "utf8" });
    expect(fileContext).to.equal(
      "https://cats.com/cat\nhttps://dogs.com/dog\n"
    );
  });
});
