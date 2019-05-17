import { Injectable } from "@nestjs/common";

import { RepoAuth } from "../../../core";
import { GitRemotePermission } from "../permissions";

const TOKEN_INVALIDATE_TIMEOUT = 60_000; // 60s

@Injectable()
export class PermissionCacheService {
  private tokenPermissions = new Map<string, GitRemotePermission>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  public getPermission(auth: RepoAuth, remote: string): GitRemotePermission | undefined {
    return this.tokenPermissions.get(this.getMapKey(auth, remote));
  }

  public setPermission(auth: RepoAuth, remote: string, permission: GitRemotePermission) {
    const key = this.getMapKey(auth, remote);
    this.tokenPermissions.set(key, permission);
    this.timeoutPermission(key);
  }

  /**
   * Remove the cached permission after a timeout
   */
  private timeoutPermission(key: string) {
    const existingTimeout = this.timeouts.get(key);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      this.timeouts.delete(key);
    }

    this.timeouts.set(
      key,
      setTimeout(() => {
        this.tokenPermissions.delete(key);
        this.timeouts.delete(key);
      }, TOKEN_INVALIDATE_TIMEOUT),
    );
  }

  private getMapKey(auth: RepoAuth, remote: string) {
    return `${auth.hash()}/${remote}`;
  }
}
