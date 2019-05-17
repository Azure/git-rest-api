import { GitRemotePermission } from "../permissions";
import { PermissionCacheService } from "./permission-cache.service";

const remote = "github.com/Azure/git-rest-specs";
describe("PermissionService", () => {
  let service: PermissionCacheService;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    service = new PermissionCacheService();
  });

  it("returns undefined when permission has not been set", () => {
    expect(service.getPermission("token-1", remote)).toBeUndefined();
  });

  it("set a permission", () => {
    service.setPermission("token-1", remote, GitRemotePermission.Read);
    expect(service.getPermission("token-1", remote)).toBe(GitRemotePermission.Read);
  });

  it("clear permission after a timeout", () => {
    service.setPermission("token-1", remote, GitRemotePermission.Read);
    expect(service.getPermission("token-1", remote)).toBe(GitRemotePermission.Read);
    jest.runTimersToTime(60_000);
    expect(service.getPermission("token-1", remote)).toBeUndefined();
  });
});
