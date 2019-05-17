import { createParamDecorator } from "@nestjs/common";
import { ApiImplicitHeaders } from "@nestjs/swagger";

import { AUTH_HEADERS, RepoAuth } from "./repo-auth";

/**
 * Auth param decorator for controller to inject the repo auth object
 */
export const Auth = createParamDecorator(
  (_, req): RepoAuth => {
    return new RepoAuth(req.headers);
  },
);

/**
 * Helper to add on methods using the Auth parameter for the swagger specs to be generated correctly
 */
export function ApiHasPassThruAuth() {
  return ApiImplicitHeaders(
    Object.values(AUTH_HEADERS).map(header => {
      return {
        name: header,
        required: false,
      };
    }),
  );
}
