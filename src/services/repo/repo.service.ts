import { Injectable, NotFoundException } from "@nestjs/common";
import { Remote, Repository } from "nodegit";
import path from "path";

import { RepoAuth } from "../../core";
import { FSService } from "../fs";
import { GitFetchService, repoCacheFolder } from "../git-fetch";
import { GitRemotePermission, PermissionService } from "../permission";

export function getRepoMainPath(remote: string, namespace?: string) {
  if (namespace) {
    return path.join(repoCacheFolder, namespace, encodeURIComponent(remote));
  }
  return path.join(repoCacheFolder, encodeURIComponent(remote));
}

export interface GitBaseOptions {
  auth?: RepoAuth;
}

export interface RemoteDef {
  remote: string;
  name: string;
}

@Injectable()
export class RepoService {
  constructor(
    private fs: FSService,
    private fetchService: GitFetchService,
    private permissionService: PermissionService,
  ) {}

  public async get(remote: string, options: GitBaseOptions = {}): Promise<Repository> {
    const repoPath = getRepoMainPath(remote);

    if (await this.fs.exists(repoPath)) {
      const repo = await Repository.open(repoPath);
      return this.fetchService.fetch(remote, repo, options);
    } else {
      return this.fetchService.clone(remote, repoPath, options);
    }
  }

  public async createForCompare(base: RemoteDef, head: RemoteDef, options: GitBaseOptions = {}): Promise<Repository> {
    await this.validatePermissions([base.remote, head.remote], options);

    const repoPath = getRepoMainPath(`${base.remote}-${head.remote}`, "compare");
    if (await this.fs.exists(repoPath)) {
      return Repository.open(repoPath);
    }
    const repo = await Repository.init(repoPath, 0);
    await Promise.all([
      Remote.create(repo, base.name, `https://${base.remote}`),
      Remote.create(repo, head.name, `https://${head.remote}`),
    ]);
    await repo.fetchAll();
    return repo;
  }

  public async validatePermissions(remotes: string[], options: GitBaseOptions) {
    await Promise.all(
      remotes.map(async remote => {
        const permission = await this.permissionService.get(options.auth || new RepoAuth(), remote);
        if (permission === GitRemotePermission.None) {
          throw new NotFoundException(`Cannot find or missing permission to access '${remote}'`);
        }
      }),
    );
  }
}
