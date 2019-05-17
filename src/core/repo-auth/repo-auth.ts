import basicAuth from "basic-auth";
import { Cred } from "nodegit";

import { SecureUtils } from "../../utils";

export const AUTH_HEADERS = {
  generic: "x-authorization",
  github: "x-github-token",
};

/**
 * Class that handle repository authentication
 * Support generic server auth using the `x-authentication` header which is just a pass thru to the repo
 * Supoort a few helper
 * - `x-github-token`: Pass a github token to authenticate
 */
export class RepoAuth {
  private readonly username?: string;
  private readonly password?: string;

  constructor(obj?: { username: string; password: string }) {
    if (obj) {
      this.username = obj.username;
      this.password = obj.password;
    }
  }

  /**
   * Get a repo auth instance from the header
   * @param headers: Header string map
   *
   * @returns {RepoAuth} if it manage to create an object
   * @returns {undefined} if the authorization headers are invalid. This should result in an error. This is not the same as not providing any headers. This means the headers were invalid
   */
  public static fromHeaders(headers: { [key: string]: string }): RepoAuth | undefined {
    if (headers[AUTH_HEADERS.generic]) {
      const auth = parseAuthorizationHeader(headers[AUTH_HEADERS.generic]);
      if (!auth) {
        return undefined;
      }
      return new RepoAuth(auth);
    } else if (headers[AUTH_HEADERS.github]) {
      return new RepoAuth({
        username: headers[AUTH_HEADERS.github],
        password: "x-oauth-basic",
      });
    }
    return new RepoAuth();
  }

  public toCreds(): Cred | undefined {
    if (this.username && this.password) {
      return Cred.userpassPlaintextNew(this.username, this.password);
    }
    return undefined;
  }

  public toAuthorizationHeader(): string | undefined {
    if (this.username && this.password) {
      const header = `${this.username}:${this.password}`;
      return `Basic ${Buffer.from(header).toString("base64")}`;
    }
    return undefined;
  }

  public hash(): string | undefined {
    const header = this.toAuthorizationHeader();

    return header ? SecureUtils.sha512(header) : undefined;
  }
}

/**
 * Parse the authorization header into username and password.
 * Needs to be in this format for now
 * `Basic [base64Encoded(username:password)`
 */
function parseAuthorizationHeader(header: string) {
  const result = basicAuth.parse(header);
  if (!result) {
    return undefined;
  }
  return { username: result.name, password: result.pass };
}
