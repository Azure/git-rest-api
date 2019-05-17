import { Injectable } from "@nestjs/common";

import { RepoAuth } from "../../core";
import { PermissionCacheService } from "./cache";
import { GitRemotePermission } from "./permissions";

@Injectable()
export class PermissionService {
  constructor(private cache: PermissionCacheService) {}
  public async getPermission(auth: RepoAuth, remote: string): Promise<GitRemotePermission | undefined> {
    const cached = this.cache.getPermission(auth, remote);
    if (cached) {
      return cached;
    }
    return Promise.resolve(undefined);
  }

  public setPermission(token: RepoAuth, remote: string, permission: GitRemotePermission) {}
}
