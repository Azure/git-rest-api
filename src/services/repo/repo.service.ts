import { Injectable, NotFoundException } from "@nestjs/common";
import { Remote, Repository } from "nodegit";
import path from "path";

import { GCRepo, RepoAuth } from "../../core";
import { FSService } from "../fs";
import { GitFetchService } from "../git-fetch";
import { GitRemotePermission, PermissionService } from "../permission";

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
  private cloningRepos = new Map<string, Promise<GCRepo>>();

  constructor(
    private fs: FSService,
    private fetchService: GitFetchService,
    private permissionService: PermissionService,
  ) {}

  public async use<T>(remote: string, options: GitBaseOptions, action: (repo: Repository) => Promise<T>): Promise<T> {
    const repo = await this.get(remote, options);
    return this.using(repo, action);
  }

  public async using<T>(repo: GCRepo, action: (repo: Repository) => Promise<T>): Promise<T> {
    try {
      const response = await action(repo.instance);
      repo.unlock();
      return response;
    } catch (error) {
      repo.unlock();
      throw error;
    }
  }

  /**
   * Be carfull with using this one. Repository object needs to be clenup. Make sure its with `using` to ensure it gets cleanup after
   */
  public async get(remote: string, options: GitBaseOptions = {}): Promise<GCRepo> {
    await this.validatePermissions([remote], options);
    const repoPath = this.getRepoMainPath(remote);

    return this.loadRepo({
      repoPath,
      fetch: repo => this.fetchService.fetch(remote, repo, options),
      clone: () => this.fetchService.clone(remote, repoPath, options),
    });
  }

  public async createForCompare(base: RemoteDef, head: RemoteDef, options: GitBaseOptions = {}): Promise<GCRepo> {
    await this.validatePermissions([base.remote, head.remote], options);
    const localName = `${base.remote}-${head.remote}`;
    const repoPath = this.getRepoMainPath(localName, "compare");

    const fetch = (repo: Repository) => this.fetchService.fetch(localName, repo, options);
    return this.loadRepo({
      repoPath,
      fetch,
      clone: async () => {
        const repo = await this.cloneWithMultiRemote(repoPath, [head, base]);
        await fetch(repo);
        return repo;
      },
    });
  }

  /**
   * Generic repo loader that manage concurrency issue with cloning/fetching a repo
   */
  private async loadRepo(config: {
    repoPath: string;
    fetch: (repo: Repository) => Promise<unknown>;
    clone: () => Promise<Repository>;
  }) {
    const repoPath = config.repoPath;
    const cloningRepo = this.cloningRepos.get(repoPath);
    if (cloningRepo) {
      return cloningRepo.then(x => {
        x.lock(); // Need to lock the repo as this object can be shared between requests
        return x;
      });
    }
    const exists = await this.fs.exists(repoPath);
    const isCloningRepo = this.cloningRepos.get(repoPath);
    if (isCloningRepo) {
      return isCloningRepo.then(x => {
        x.lock(); // Need to lock the repo as this object can be shared between requests
        return x;
      });
    }

    if (exists) {
      const repo = await Repository.open(repoPath);
      await config.fetch(repo);
      return new GCRepo(repo);
    } else {
      const cloneRepoPromise = config.clone().then(repo => {
        this.cloningRepos.delete(repoPath);
        return new GCRepo(repo);
      });
      this.cloningRepos.set(repoPath, cloneRepoPromise);
      return cloneRepoPromise;
    }
  }

  private async cloneWithMultiRemote(repoPath: string, remotes: RemoteDef[]) {
    const repo = await Repository.init(repoPath, 0);
    // Remotes cannot be added in parrelel.
    for (const { name, remote } of remotes) {
      await Remote.create(repo, name, `https://${remote}`);
    }

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

  private getRepoMainPath(remote: string, namespace?: string) {
    if (namespace) {
      return path.join(this.fetchService.repoCacheFolder, namespace, encodeURIComponent(remote));
    }
    return path.join(this.fetchService.repoCacheFolder, encodeURIComponent(remote));
  }
}
