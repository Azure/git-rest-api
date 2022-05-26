import { Injectable } from "@nestjs/common";

import { RepoAuth } from "../../core";
import { RepoUtils } from "../../utils";
import { HttpService } from "../http";
import { PermissionCacheService } from "./cache";
import { GitRemotePermission } from "./permissions";

@Injectable()
export class PermissionService {
  constructor(private cache: PermissionCacheService, private http: HttpService) {}

  public async get(auth: RepoAuth, remote: string): Promise<GitRemotePermission> {
    const cached = this.cache.get(auth, remote);
    if (cached !== undefined) {
      return cached;
    }
    return this.retrievePermissions(auth, remote);
  }

  public set(auth: RepoAuth, remote: string, permission: GitRemotePermission) {
    return this.cache.set(auth, remote, permission);
  }

  private async retrievePermissions(auth: RepoAuth, remote: string) {
    const gitUrl = RepoUtils.getUrl(remote);
    const canWrite = await this.checkWritePermission(auth, gitUrl);
    if (canWrite) {
      return this.set(auth, remote, GitRemotePermission.Write);
    }

    const canRead = await this.checkReadPermission(auth, gitUrl);
    if (canRead) {
      return this.set(auth, remote, GitRemotePermission.Read);
    }
    return this.set(auth, remote, GitRemotePermission.None);
  }

  private async checkWritePermission(auth: RepoAuth, gitUrl: string): Promise<boolean> {
    const response = await this.http.fetch(`${gitUrl}/${GitServices.Push}`, {
      headers: this.getHeaders(auth),
      method: "POST",
    });
    return response.status === 200;
  }

  private async checkReadPermission(auth: RepoAuth, gitUrl: string): Promise<boolean> {
    const response = await this.http.fetch(`${gitUrl}/${GitServices.Pull}`, {
      headers: this.getHeaders(auth),
      method: "POST",
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
