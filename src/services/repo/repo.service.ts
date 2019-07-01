import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "nodegit";
import path from "path";

import { Configuration } from "../../config";
import { Logger, RepoAuth } from "../../core";
import { FSService } from "../fs";
import { GitRemotePermission, PermissionService } from "../permission";
import { RepoIndexService } from "../repo-index";
import { LocalRepo, RemoteDef } from "./local-repo/local-repo";

export interface GitBaseOptions {
  auth?: RepoAuth;
}

@Injectable()
export class RepoService {
  public readonly repoCacheFolder = path.join(this.config.dataDir, "repos");

  /**
   * Map that contains a key and promise when cloning a given repo
   */
  private openedRepos = new Map<string, LocalRepo>();
  private deletingRepos = new Map<string, Promise<boolean>>();

  private logger = new Logger(RepoService);

  constructor(
    private config: Configuration,
    private fs: FSService,
    private repoIndexService: RepoIndexService,
    private permissionService: PermissionService,
  ) {}

  public async use<T>(remote: string, options: GitBaseOptions, action: (repo: Repository) => Promise<T>): Promise<T> {
    await this.validatePermissions([remote], options);
    const repoPath = this.getRepoMainPath(remote);
    const origin = {
      name: "origin",
      remote,
    };
    return this.useWithRemotes(repoPath, options, [origin], action);
  }

  public async useForCompare<T>(
    base: RemoteDef,
    head: RemoteDef,
    options: GitBaseOptions = {},
    action: (repo: Repository) => Promise<T>,
  ): Promise<T> {
    await this.validatePermissions([base.remote, head.remote], options);
    const localName = `${base.remote}-${head.remote}`;
    const repoPath = this.getRepoMainPath(localName, "compare");

    return this.useWithRemotes(repoPath, options, [base, head], action);
  }

  public async deleteLocalRepo(repoPath: string): Promise<boolean> {
    const existingDeletion = this.deletingRepos.get(repoPath);
    if (existingDeletion) {
      return existingDeletion;
    }
    if (this.openedRepos.has(repoPath)) {
      this.logger.info("Can't delete this repo has its opened");
      return false;
    }

    const promise = this.fs
      .rm(repoPath)
      .then(() => true)
      .finally(() => {
        this.deletingRepos.delete(repoPath);
        this.repoIndexService.markRepoAsRemoved(repoPath);
      });

    this.deletingRepos.set(repoPath, promise);
    return promise;
  }

  private async useWithRemotes<T>(
    repoPath: string,
    options: GitBaseOptions,
    remotes: RemoteDef[],
    action: (repo: Repository) => Promise<T>,
  ): Promise<T> {
    this.repoIndexService.markRepoAsOpened(repoPath);
    let repo = this.openedRepos.get(repoPath);

    // If repo is deleting wait for it to be deleted and reinit again
    const deletion = this.deletingRepos.get(repoPath);
    if (deletion) {
      await deletion;
    }

    if (!repo) {
      repo = new LocalRepo(repoPath, this.fs, this.repoIndexService);
      this.openedRepos.set(repoPath, repo);
      repo.onDestroy.subscribe(() => {
        this.openedRepos.delete(repoPath);
      });
      await repo.init(remotes);
    } else {
      repo.ref();
    }
    if (this.repoIndexService.needToFetch(repoPath)) {
      await repo.update(options);
    }
    const response = await repo.use(action);
    repo.unref();
    return response;
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
      return path.join(this.repoCacheFolder, namespace, encodeURIComponent(remote));
    }
    return path.join(this.repoCacheFolder, encodeURIComponent(remote));
  }
}
