import { Context } from "./crawler";

export const parseHtmlAndCollectRelativeLinks = (
  ctx: Context,
  requestBody: string
): string[] => {
  const $ = ctx.clients.htmlParser.load(requestBody);
  const relativeLinks: string[] = [];

  const relativeLinkElements = $("a[href^='/']");
  relativeLinkElements.each((_: number, element: HTMLLIElement) => {
    relativeLinks.push($(element).attr("href"));
  });

  return relativeLinks;
};
