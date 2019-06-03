import { ApiImplicitQuery, ApiImplicitHeaders } from "@nestjs/swagger";
import { createParamDecorator } from "@nestjs/common";
import { Request } from "express";

/**
 * Decorator to let swagger know about all the pagination properties available
 */
export function ApiHasPagination(): MethodDecorator {
  const implicitpage = ApiImplicitQuery({ name: "page", required: false });
    ApiImplicitHeaders
  return (...args) => {
    implicitpage(...args);
  };
}

export interface Pagination {
  page?: number;
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

