import fs from "fs";
import { URL } from "url";
import lockfile from "proper-lockfile";

import { Context } from "./crawler";

type ReporterContext = Pick<Context, "config">;

/**
 * addUrlToOutputFile
 * adds url to the output file.
 * Locks the file before writing to it
 * Unlocks the file after writing to it.
 */
export const addUrlToOutputFile = async (ctx: ReporterContext, url: URL) => {
  const outputFilePath = ctx.config.reporter.outputFilePath;
  const release = await lockfile.lock(outputFilePath);
  try {
    const urlWithNewLine = url.toString() + "\n";
    fs.appendFileSync(ctx.config.reporter.outputFilePath, urlWithNewLine);
    await release(); // how to handle if this step errors? need to think about it.
  } catch (err) {
    await release(); // how to handle if this step errors? need to think about it.
    // TODO: log the missing URLs somewhere I guess.
    throw new Error("error writing to file");
  }
};
