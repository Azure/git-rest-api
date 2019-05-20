import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "nodegit";
import path from "path";

import { RepoAuth } from "../../core";
import { FSService } from "../fs";
import { GitFetchService, repoCacheFolder } from "../git-fetch";
import { GitRemotePermission, PermissionService } from "../permission";

export function getRepoMainPath(remote: string) {
  return path.join(repoCacheFolder, encodeURIComponent(remote));
}

export interface GitBaseOptions {
  auth?: RepoAuth;
}

@Injectable()
export class RepoService {
  constructor(
    private fs: FSService,
    private fetchService: GitFetchService,
    private permissionService: PermissionService,
  ) {}

  public async get(remote: string, options: GitBaseOptions = {}): Promise<Repository> {
    const permission = await this.permissionService.get(options.auth || new RepoAuth(), remote);
    if (permission === GitRemotePermission.None) {
      throw new NotFoundException(`Cannot find or missing permission to access '${remote}'`);
    }
    const repoPath = getRepoMainPath(remote);

    if (await this.fs.exists(repoPath)) {
      const repo = await Repository.open(repoPath);
      return this.fetchService.fetch(remote, repo, options);
    } else {
      return this.fetchService.clone(remote, repoPath, options);
    }
  }
}
