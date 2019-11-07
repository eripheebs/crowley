import { expect } from "chai";
import fs from "fs";
import rimraf from "rimraf";
import { addUrlToOutputFile } from "../reporter";
import { createConfig } from "../../config";
import { generateContext } from "./context.fixtures";
import { URL } from "url";

describe("addUrlToOutputFile", () => {
  const filePath = "test-file.txt";
  const config = createConfig({
    outputFilePath: filePath
  });
  const context = generateContext({
    config: config
  });

  afterEach(() => {
    // delete temporary test files
    rimraf.sync(filePath);
  });

  it("creates output file if it doesnt exist", async () => {
    const testUrl = new URL("https://google.com");
    await addUrlToOutputFile(context, testUrl);
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).to.be.true;
  });

  beforeEach(() => {
    // create temporary test files
    fs.writeFileSync(filePath, "");
  });

  it("adds url to test file", async () => {
    const testUrl = new URL("https://google.com");
    await addUrlToOutputFile(context, testUrl);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    expect(fileContent).to.equal(`${testUrl}\n`);
  });

  it("adds url to test file with a new line per url", async () => {
    const testUrl = new URL("https://cats.com/cat");
    const anotherTestUrl = new URL("https://dogs.com/dog");
    await addUrlToOutputFile(context, testUrl);
    await addUrlToOutputFile(context, anotherTestUrl);
    const fileContent = fs.readFileSync(filePath, { encoding: "utf8" });
    expect(fileContent).to.equal(
      "https://cats.com/cat\nhttps://dogs.com/dog\n"
    );
  });
});
