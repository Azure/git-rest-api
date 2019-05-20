import { BadRequestException, createParamDecorator } from "@nestjs/common";
import { ApiBadRequestResponse, ApiImplicitHeaders } from "@nestjs/swagger";

import { AUTH_HEADERS, RepoAuth } from "./repo-auth";

/**
 * Auth param decorator for controller to inject the repo auth object
 */
export const Auth = createParamDecorator(
  (_, req): RepoAuth => {
    const repoAuth = RepoAuth.fromHeaders(req.headers);
    if (repoAuth) {
      return repoAuth;
    } else {
      throw new BadRequestException("Repository authorization is malformed");
    }
  },
);

/**
 * Helper to add on methods using the Auth parameter for the swagger specs to be generated correctly
 */
export function ApiHasPassThruAuth(): MethodDecorator {
  const implicitHeaders = ApiImplicitHeaders(
    Object.values(AUTH_HEADERS).map(header => {
      return {
        name: header,
        required: false,
      };
    }),
  );
  const badRequestResponse = ApiBadRequestResponse({
    description: "When the x-authorization header is malformed",
  });

  return (...args) => {
    implicitHeaders(...args);
    badRequestResponse(...args);
  };
}
