import { RepoAuth } from "../../core";
import { PermissionCacheService } from "./cache";
import { PermissionService } from "./permission.service";
import { GitRemotePermission } from "./permissions";

const remote = "github.com/Azure/some-repo";
const remotePrivate = "github.com/Azure/some-private";
const auth = new RepoAuth({ username: "token-1", password: "x-oauth-token" });

describe("PermissionService", () => {
  let service: PermissionService;
  let cache: PermissionCacheService;
  const httpSpy = {
    fetch: jest.fn(uri => {
      if (uri.includes(remote) && uri.includes("git-upload-pack")) {
        return { status: 200 };
      } else if (uri.includes(remotePrivate)) {
        return { status: 200 };
      }
      return {
        status: 404,
      };
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    cache = new PermissionCacheService();
    service = new PermissionService(cache, httpSpy as any);
  });

  it("returns the permission in the cache if its there", async () => {
    cache.set(auth, remote, GitRemotePermission.Read);
    expect(await service.get(auth, remote)).toBe(GitRemotePermission.Read);
  });

  it("returns none when permission is set to none", async () => {
    service.set(auth, remote, GitRemotePermission.None);
    expect(await service.get(auth, remote)).toBe(GitRemotePermission.None);
  });

  describe("when permission are not cached", () => {
    it("try write endpoint", async () => {
      const permission = await service.get(auth, remotePrivate);
      expect(permission).toBe(GitRemotePermission.Write);
      expect(cache.get(auth, remotePrivate)).toBe(GitRemotePermission.Write);

      expect(httpSpy.fetch).toHaveBeenCalledTimes(1);

      expect(httpSpy.fetch).toHaveBeenCalledWith("https://github.com/Azure/some-private.git/git-receive-pack", {
        headers: {
          Authorization: auth.toAuthorizationHeader(),
        },
      });
    });

    it("try write endpoint then read if can't write", async () => {
      const permission = await service.get(auth, remote);
      expect(permission).toBe(GitRemotePermission.Read);
      expect(cache.get(auth, remote)).toBe(GitRemotePermission.Read);

      expect(httpSpy.fetch).toHaveBeenCalledTimes(2);

      expect(httpSpy.fetch).toHaveBeenCalledWith("https://github.com/Azure/some-repo.git/git-receive-pack", {
        headers: {
          Authorization: auth.toAuthorizationHeader(),
        },
      });

      expect(httpSpy.fetch).toHaveBeenCalledWith("https://github.com/Azure/some-repo.git/git-upload-pack", {
        headers: {
          Authorization: auth.toAuthorizationHeader(),
        },
      });
    });

    it("try write and read if has no permission", async () => {
      const permission = await service.get(auth, "github.com/Azure/other-repo-no-permissions");
      expect(permission).toBe(GitRemotePermission.None);
      expect(cache.get(auth, "github.com/Azure/other-repo-no-permissions")).toBe(GitRemotePermission.None);

      expect(httpSpy.fetch).toHaveBeenCalledTimes(2);

      expect(httpSpy.fetch).toHaveBeenCalledWith(
        "https://github.com/Azure/other-repo-no-permissions.git/git-receive-pack",
        {
          headers: {
            Authorization: auth.toAuthorizationHeader(),
          },
        },
      );

      expect(httpSpy.fetch).toHaveBeenCalledWith(
        "https://github.com/Azure/other-repo-no-permissions.git/git-upload-pack",
        {
          headers: {
            Authorization: auth.toAuthorizationHeader(),
          },
        },
      );
    });
  });
});
