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
    expect(service.getPermission(auth, remote)).toBeUndefined();
  });

  it("set a permission", () => {
    service.setPermission(auth, remote, GitRemotePermission.Read);
    expect(service.getPermission(auth, remote)).toBe(GitRemotePermission.Read);
  });

  it("clear permission after a timeout", () => {
    service.setPermission(auth, remote, GitRemotePermission.Read);
    expect(service.getPermission(auth, remote)).toBe(GitRemotePermission.Read);
    jest.runTimersToTime(60_000);
    expect(service.getPermission(auth, remote)).toBeUndefined();
  });
});
