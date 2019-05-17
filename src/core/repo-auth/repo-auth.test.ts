import { Cred } from "nodegit";

import { RepoAuth } from "./repo-auth";

describe("RepoAuth", () => {
  describe("Model", () => {
    it("doesn't generated any creds when no options are passed", () => {
      expect(new RepoAuth({}).toCreds()).toBeUndefined();
    });

    it("doesn't generate some basic password creds when using oath token", () => {
      expect(new RepoAuth({ "x-github-token": "token-1" }).toCreds()).toEqual(
        Cred.userpassPlaintextNew("token-1", "x-oauth-basic"),
      );
    });
  });
});
