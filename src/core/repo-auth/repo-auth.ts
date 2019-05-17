import basicAuth from "basic-auth";
import { Cred } from "nodegit";

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
  private username?: string;
  private password?: string;

  constructor(headers: { [key: string]: string }) {
    if (headers[AUTH_HEADERS.generic]) {
      const auth = parseAuthorizationHeader(headers[AUTH_HEADERS.generic]);
      if (auth) {
        this.username = auth.username;
        this.password = auth.password;
      }
    } else if (headers[AUTH_HEADERS.github]) {
      this.username = headers[AUTH_HEADERS.github];
      this.password = "x-oauth-basic";
    }
  }

  public async toCreds(): Promise<Cred | undefined> {
    if (!this.username) {
      return undefined;
    }
    if (this.password) {
      return Cred.userpassPlaintextNew(this.username, this.password);
    } else {
      const cred = await Cred.userpassPlaintextNew("", this.username);
      return cred;
    }
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
    return;
  }
  return { username: result.name, password: result.pass };
}
