import { createParamDecorator } from "@nestjs/common";
import { ApiImplicitHeaders } from "@nestjs/swagger";
import { Cred } from "nodegit";

export interface IRepoAuth {
  token?: string;
}

export class RepoAuth {
  private token: string | undefined;

  constructor(obj: IRepoAuth) {
    this.token = obj.token;
  }

  public toCreds() {
    if (this.token) {
      return Cred.userpassPlaintextNew(this.token, "x-oauth-basic");
    } else {
      return null;
    }
  }
}

const TOKEN_HEADER = "x-oauth-basic";

export const Auth = createParamDecorator(
  (_, req): RepoAuth => {
    return new RepoAuth({
      token: req.headers[TOKEN_HEADER],
    });
  },
);

/**
 * Helper to add on methods using the Auth parameter for the swagger specs to be generated correctly
 */
export function ApiHasPassThruAuth() {
  return ApiImplicitHeaders([
    {
      name: TOKEN_HEADER,
      required: false,
    },
  ]);
}
