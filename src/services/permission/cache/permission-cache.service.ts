import { Injectable } from "@nestjs/common";

import { RepoAuth } from "../../../core";
import { GitRemotePermission } from "../permissions";

const TOKEN_INVALIDATE_TIMEOUT = 60_000; // 60s

export interface CachedPermission {
  lastSync: number; // Date
  permission: GitRemotePermission;
}

@Injectable()
export class PermissionCacheService {
  private tokenPermissions = new Map<string, CachedPermission>();

  public get(auth: RepoAuth, remote: string): GitRemotePermission | undefined {
    const key = this.getMapKey(auth, remote);
    const cache = this.tokenPermissions.get(key);
    if (cache === undefined) {
      return undefined;
    }
    const now = Date.now();

    if (now - cache.lastSync > TOKEN_INVALIDATE_TIMEOUT) {
      this.tokenPermissions.delete(key);
      return undefined;
    }
    return cache.permission;
  }

  public set(auth: RepoAuth, remote: string, permission: GitRemotePermission): GitRemotePermission {
    const key = this.getMapKey(auth, remote);
    this.tokenPermissions.set(key, { permission, lastSync: Date.now() });
    return permission;
  }

  private getMapKey(auth: RepoAuth, remote: string) {
    return `${auth.hash()}/${remote}`;
  }
}
