import { Response } from "express";

export interface PaginatedList<T> {
  items: T[];
  page: number;
}

export function applyPaginatedResponse(attributes: PaginatedList<any>, response: Response) {
  if (response.req) {
    const originalUrl = `${response.req.protocol}://${response.req.get("host")}${response.req.originalUrl}`;
    const nextUrl = new URL(originalUrl);
    nextUrl.searchParams.set("page", (attributes.page + 1).toString());
    const links = [`<${nextUrl}>; rel="next"`];

    if (attributes.page > 1) {
      const prevUrl = new URL(originalUrl);
      prevUrl.searchParams.set("page", (attributes.page - 1).toString());
      links.unshift(`<${prevUrl}>; rel="prev"`);
    }
    response.setHeader("Link", links.join(", "));
  }
  response.send(attributes.items);
}
