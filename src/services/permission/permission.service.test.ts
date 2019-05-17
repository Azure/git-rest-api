import { PermissionService, GitRemotePermission } from "./permission.service";

const remote = "github.com/Azure/git-rest-specs";
describe("PermissionService", () => {
  let service: PermissionService;

  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
    service = new PermissionService();
  });

  it("returns undefined when permission has not been set", () => {
    expect(service.getTokenPermission("token-1", remote)).toBeUndefined();
  });

  it("set a permission", () => {
    service.setTokenPermission("token-1", remote, GitRemotePermission.Read);
    expect(service.getTokenPermission("token-1", remote)).toBe(GitRemotePermission.Read);
  });

  it("clear permission after a timeout", () => {
    service.setTokenPermission("token-1", remote, GitRemotePermission.Read);
    expect(service.getTokenPermission("token-1", remote)).toBe(GitRemotePermission.Read);
    jest.runTimersToTime(60_000);
    expect(service.getTokenPermission("token-1", remote)).toBeUndefined();
  });
});
