import fs from "fs";
import { URL } from "url";
import lockfile from "proper-lockfile";

import { Context } from "./index";
import { release } from "os";

type ReporterContext = Pick<Context, "config">;

/**
 * addUrlToOutputFile
 * adds url to the output file.
 * Locks the file before writing to it
 * Unlocks the file after writing to it.
 */
export const addUrlToOutputFile = async (ctx: ReporterContext, url: URL) => {
  const outputFilePath = ctx.config.reporter.outputFilePath;

  if (!fs.existsSync(outputFilePath)) {
    fs.writeFileSync(outputFilePath, "");
  }

  try {
    const release = await lockfile.lock(outputFilePath);
    const urlWithNewLine = url.toString() + "\n";
    fs.appendFileSync(outputFilePath, urlWithNewLine);
    await release(); // how to handle if this step errors? need to think about it.
  } catch (err) {
    await release(); // how to handle if this step errors? need to think about it.
  }
};
