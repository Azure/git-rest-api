import { createParamDecorator } from "@nestjs/common";
import { ApiQuery, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";

import { TOTAL_COUNT_HEADER } from "./paginated-response";
import { Pagination } from "./pagination";

/**
 * Decorator to let swagger know about all the pagination properties available
 */
export function ApiPaginated(type: any): MethodDecorator {
  const implicitpage = ApiQuery({ name: "page", required: false, type: String });
  const response = ApiResponse({ status: 200, headers: paginationHeaders, type, isArray: true });
  return (...args) => {
    implicitpage(...args);
    response(...args);
  };
}

/**
 * Auth param decorator for controller to inject the repo auth object
 */
export const Page = createParamDecorator(
  (_, req: Request): Pagination => {
    const page = parseInt(req.query.page, 10);
    return {
      page: isNaN(page) ? undefined : page,
    };
  },
);

const paginationHeaders = {
  Link: {
    type: "string",
    description:
      "Links to navigate pagination in the format defined by [RFC 5988](https://tools.ietf.org/html/rfc5988#section-5). It will include next, last, first and prev links if applicable",
  },
  [TOTAL_COUNT_HEADER]: {
    type: "integer",
    description: "Total count of items that can be retrieved",
  },
};
