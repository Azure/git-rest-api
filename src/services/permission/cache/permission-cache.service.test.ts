import { RepoAuth } from "../../../core";
import { GitRemotePermission } from "../permissions";
import { PermissionCacheService } from "./permission-cache.service";

const remote = "github.com/Azure/git-rest-specs";

const auth = new RepoAuth({ username: "token-1", password: "x-oauth-token" });
describe("PermissionService", () => {
  let service: PermissionCacheService;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    service = new PermissionCacheService();
  });

  it("returns undefined when permission has not been set", () => {
    expect(service.get(auth, remote)).toBeUndefined();
  });

  it("returns none when permission is set to none", () => {
    service.set(auth, remote, GitRemotePermission.None);
    expect(service.get(auth, remote)).toBe(GitRemotePermission.None);
  });

  it("set a permission", () => {
    service.set(auth, remote, GitRemotePermission.Read);
    expect(service.get(auth, remote)).toBe(GitRemotePermission.Read);
  });

  it("clear permission after a timeout", () => {
    const now = Date.now();

    service.set(auth, remote, GitRemotePermission.Read);
    expect(service.get(auth, remote)).toBe(GitRemotePermission.Read);
    mockDate(now + 50_000);
    // Should still be cached
    expect(service.get(auth, remote)).toBe(GitRemotePermission.Read);

    mockDate(now + 60_010);
    expect(service.get(auth, remote)).toBeUndefined();
  });

  it("doesn't get permission from another key", () => {
    service.set(auth, remote, GitRemotePermission.Read);
    expect(service.get(new RepoAuth(), remote)).toBeUndefined();
    expect(service.get(new RepoAuth({ username: "foo", password: "x-oauth-token" }), remote)).toBeUndefined();
    expect(service.get(new RepoAuth({ username: "token-1", password: "x-other-token" }), remote)).toBeUndefined();
  });
});

function mockDate(now: number) {
  jest.spyOn(global.Date, "now").mockImplementation(() => now);
}
