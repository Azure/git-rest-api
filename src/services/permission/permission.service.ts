import { Injectable } from "@nestjs/common";

import { RepoAuth } from "../../core";
import { RepoUtils } from "../../utils";
import { HttpService } from "../http";
import { PermissionCacheService } from "./cache";
import { GitRemotePermission } from "./permissions";

@Injectable()
export class PermissionService {
  constructor(private cache: PermissionCacheService, private http: HttpService) {}

  public async getPermission(auth: RepoAuth, remote: string): Promise<GitRemotePermission> {
    const cached = this.cache.getPermission(auth, remote);
    if (cached) {
      return cached;
    }
    return this.retrievePermissions(auth, remote);
  }

  public setPermission(auth: RepoAuth, remote: string, permission: GitRemotePermission) {
    return this.cache.setPermission(auth, remote, permission);
  }

  private async retrievePermissions(auth: RepoAuth, remote: string) {
    const gitUrl = RepoUtils.getUrl(remote);
    const canRead = await this.checkReadPermission(auth, gitUrl);
    if (canRead) {
      this.setPermission(auth, remote, GitRemotePermission.Read);
    }

    const canWrite = await this.checkWritePermission(auth, gitUrl);
    if (canWrite) {
      return this.setPermission(auth, remote, GitRemotePermission.Write);
    } else if (canRead) {
      return GitRemotePermission.Read;
    }
    return this.setPermission(auth, remote, GitRemotePermission.None);
  }

  private async checkWritePermission(auth: RepoAuth, gitUrl: string): Promise<boolean> {
    const response = await this.http.fetch(`${gitUrl}/${GitServices.Push}`, {
      headers: this.getHeaders(auth),
    });
    return response.status === 200;
  }

  private async checkReadPermission(auth: RepoAuth, gitUrl: string): Promise<boolean> {
    const response = await this.http.fetch(`${gitUrl}/${GitServices.Pull}`, {
      headers: this.getHeaders(auth),
    });
    return response.status === 200;
  }

  private getHeaders(auth: RepoAuth): StringMap<string> {
    const header = auth.toAuthorizationHeader();
    if (!header) {
      return {};
    }
    return {
      Authorization: header,
    };
  }
}

enum GitServices {
  Push = "git-receive-pack",
  Pull = "git-upload-pack",
}
