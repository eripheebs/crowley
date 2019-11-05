import cheerio from "cheerio";

export type HTMLParser = CheerioAPI;

/**
 * This is the default html parser
 * TODO: add no-op client.
 */
export function createHTMLParser(): HTMLParser {
  return cheerio;
}
