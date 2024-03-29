import cheerio from "cheerio";
import { URL } from "url";

export const relativeLinkToUrl = ({
  relativePath,
  baseUrl
}: {
  relativePath: string;
  baseUrl: string;
}): URL => {
  return new URL(`${baseUrl}${relativePath}`);
};

/**
 * parseHtmlAndCollectRelativeLinks
 * This function assumes the html to be valid html
 * parses the requestBody (uses j query syntax from package cheerio)
 * finds all relative links
 * returns all relative links
 */
export const parseHtmlAndCollectRelativeLinks = (html: string): string[] => {
  // TODO add HTML validation
  const $ = cheerio.load(html);
  const relativeLinks: string[] = [];

  const relativeLinkElements = $("a[href^='/']");
  relativeLinkElements.each((_: number, element: HTMLLIElement) => {
    relativeLinks.push($(element).attr("href"));
  });

  return relativeLinks;
};
