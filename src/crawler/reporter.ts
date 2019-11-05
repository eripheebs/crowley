import fs from "fs";
import lockfile from "proper-lockfile";

import { Context } from "./crawler";

/**
 * addUrlToOutputFile
 * adds url to the output file.
 * Locks the file before writing to it
 * Unlocks the file after writing to it.
 */
export const addUrlToOutputFile = async (ctx: Context, url: string) => {
  const outputFilePath = ctx.config.reporter.outputFilePath;
  try {
    const release = await lockfile.lock(outputFilePath);
    try {
      const urlWithNewLine = url + "\n";
      fs.appendFileSync(ctx.config.reporter.outputFilePath, urlWithNewLine);
      await release(); // how to handle if this step errors? need to think about it.
    } catch (err) {
      await release(); // how to handle if this step errors? need to think about it.
      // TODO: log the missing URLs somewhere I guess.
      throw new Error("error writing to file");
    }
  } catch (err) {
    // TODO: turn this into a typed error.
    throw new Error("error locking file");
  }
};
