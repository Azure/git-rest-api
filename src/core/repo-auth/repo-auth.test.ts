import { Cred } from "nodegit";

import { RepoAuth } from "./repo-auth";

describe("RepoAuth", () => {
  describe("Model", () => {
    it("doesn't generated any creds when no options are passed", () => {
      expect(new RepoAuth().toCreds()).toEqual(Cred.defaultNew());
    });

    it("returns undefined if invalid basic header", () => {
      expect(RepoAuth.fromHeaders({ "x-authorization": "Basi invlid" })).toBeUndefined();
    });

    it("doesn't generate some basic password creds when using oath token", () => {
      expect(RepoAuth.fromHeaders({ "x-github-token": "token-1" })!.toCreds()).toEqual(
        Cred.userpassPlaintextNew("token-1", "x-oauth-basic"),
      );
    });

    it("should return different hashes per cred", () => {
      const hash1 = new RepoAuth({ username: "foo", password: "bar" }).hash();
      const hash2 = new RepoAuth({ username: "foo2", password: "bar" }).hash();
      const hash3 = new RepoAuth({ username: "foo", password: "bar2" }).hash();

      expect(hash1).not.toBe(hash2);
      expect(hash2).not.toBe(hash3);
      expect(hash1).not.toBe(hash3);

      expect(hash1).toBe(
        "6bd974a6ce1305174fff5df0cefd2025005861ad19332177290f10af00e0b5dee8e563417bc6f509e50527d35ec48986593d347cfc41069e8bfad24e70c5eabb",
      );
      expect(hash2).toBe(
        "cd6f6487398b42e04b68676f8567d4c9494f49347862272ebe7cba3ce5c9fa2c05cdc3ee302ae42bbb00632e7ad78f1b0ecd1b37634ffcae3756b427e7c8080b",
      );
      expect(hash3).toBe(
        "34f5826bdf4f7863ede840bfc394a585c233862eee7d6c6dcdc0287b98626fae43f91f41700144c22207372b24ecdec35f6b1d4ebd882d2a5b7b25918b3c18aa",
      );
    });
  });
});
