import { Injectable } from "@nestjs/common";

import { SecureUtils } from "../../utils";
import { GitRemotePermission } from "./permissions";
import { RepoAuth } from "../../core";
import { PermissionCacheService } from "./cache";

const TOKEN_INVALIDATE_TIMEOUT = 60_000; // 60s

@Injectable()
export class PermissionService {
  private tokenPermissions = new Map<string, GitRemotePermission>();
  private timeouts = new Map<string, NodeJS.Timeout>();

  constructor(private cache: PermissionCacheService) {}
  public async getPermission(auth: RepoAuth, remote: string): Promise<GitRemotePermission | undefined> {
    return Promise.resolve(undefined);
  }

  public setPermission(token: RepoAuth, remote: string, permission: GitRemotePermission) {}
}
