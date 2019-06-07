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
  /**
   * Map that contains a key and promise when cloning a given repo
   */
  private cloningRepos = new Map<string, Promise<Repository>>();

  constructor(
    private fs: FSService,
    private fetchService: GitFetchService,
    private permissionService: PermissionService,
  ) {}

  public async use<T>(remote: string, options: GitBaseOptions, action: (repo: Repository) => Promise<T>): Promise<T> {
    const repo = await this.get(remote, options);
    return this.using(repo, action);
  }

  public async using<T>(repo: Repository, action: (repo: Repository) => Promise<T>): Promise<T> {
    try {
      const response = await action(repo);
      repo.cleanup();
      return response;
    } catch (error) {
      repo.cleanup();
      throw error;
    }
  }

  /**
   * Be carfull with using this one. Repository object needs to be clenup. Make sure its with `using` to ensure it gets cleanup after
   */
  public async get(remote: string, options: GitBaseOptions = {}): Promise<Repository> {
    await this.validatePermissions([remote], options);
    const repoPath = getRepoMainPath(remote);

    const cloningRepo = this.cloningRepos.get(repoPath);
    if (cloningRepo) {
      return cloningRepo;
    }

    const exists = await this.fs.exists(repoPath);
    // Check again if the repo didn't start cloning since the last time
    const isCloningRepo = this.cloningRepos.get(repoPath);
    if (isCloningRepo) {
      return isCloningRepo;
    }
    if (exists) {
      const repo = await Repository.open(repoPath);
      return this.fetchService.fetch(remote, repo, options);
    } else {
      const cloneRepoPromise = this.fetchService.clone(remote, repoPath, options).then(repo => {
        this.cloningRepos.delete(repoPath);
        return repo;
      });
      this.cloningRepos.set(repoPath, cloneRepoPromise);
      return cloneRepoPromise;
    }
  }

  public async createForCompare(base: RemoteDef, head: RemoteDef, options: GitBaseOptions = {}): Promise<Repository> {
    await this.validatePermissions([base.remote, head.remote], options);
    const localName = `${base.remote}-${head.remote}`;
    const repoPath = getRepoMainPath(localName, "compare");
    let repo: Repository;

    const cloningRepo = this.cloningRepos.get(repoPath);
    if (cloningRepo) {
      return cloningRepo;
    }

    const exists = await this.fs.exists(repoPath);
    // Check again if the repo didn't start cloning since the last time
    const isCloningRepo = this.cloningRepos.get(repoPath);
    if (isCloningRepo) {
      return isCloningRepo;
    }

    if (exists) {
      repo = await Repository.open(repoPath);
    } else {
      const cloneRepoPromise = this.cloneWithMultiRemote(localName, repoPath, [head, base], options).then(r => {
        this.cloningRepos.delete(repoPath);
        return r;
      });
      this.cloningRepos.set(repoPath, cloneRepoPromise);
      repo = await cloneRepoPromise;
    }

    return repo;
  }

  private async cloneWithMultiRemote(
    localName: string,
    repoPath: string,
    remotes: RemoteDef[],
    options: GitBaseOptions = {},
  ) {
    const repo = await Repository.init(repoPath, 0);
    // Remotes cannot be added in parrelel.
    for (const { name, remote } of remotes) {
      await Remote.create(repo, name, `https://${remote}`);
    }

    await this.fetchService.fetch(localName, repo, options);

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
