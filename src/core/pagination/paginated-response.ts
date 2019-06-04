import { Response } from "express";

export const TOTAL_COUNT_HEADER = "x-total-count";

export interface PaginatedList<T> {
  items: T[];
  page: number;
  perPage: number;
  // Total number of items
  total: number;
}

export function applyPaginatedResponse(attributes: PaginatedList<any>, response: Response) {
  if (response.req) {
    const originalUrl = `${response.req.protocol}://${response.req.get("host")}${response.req.originalUrl}`;
    const nextUrl = getPageUrl(originalUrl, attributes.page + 1);
    const lastUrl = getPageUrl(originalUrl, Math.ceil(attributes.total / attributes.perPage));
    const links = [`<${nextUrl}>; rel="next"`, `<${lastUrl}>; rel="last"`];

    if (attributes.page > 1) {
      const prevUrl = getPageUrl(originalUrl, attributes.page - 1);
      links.unshift(`<${prevUrl}>; rel="prev"`);
    }
    response.setHeader("Link", links.join(", "));
    response.setHeader(TOTAL_COUNT_HEADER, attributes.total);
  }
  response.send(attributes.items);
}

function getPageUrl(originalUrl: string, page: number) {
  const nextUrl = new URL(originalUrl);
  nextUrl.searchParams.set("page", page.toString());
  return nextUrl;
}
