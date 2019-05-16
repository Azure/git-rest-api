import { Injectable, NotFoundException } from "@nestjs/common";
import { Clone, Fetch, FetchOptions, Repository } from "nodegit";
import path from "path";

import { RepoAuth } from "../../core";
import { FSService } from "../fs";

const repoCacheFolder = path.join("./tmp", "repos");
export function getRepoMainPath(remote: string) {
  return path.join(repoCacheFolder, encodeURIComponent(remote));
}

const defaultFetchOptions: FetchOptions = {
  downloadTags: 0,
  prune: Fetch.PRUNE.GIT_FETCH_PRUNE,
};

export interface GitBaseOptions {
  auth?: RepoAuth;
}

@Injectable()
export class RepoService {
  private cacheReady: Promise<string>;
  constructor(private fs: FSService) {
    this.cacheReady = fs.makeDir(repoCacheFolder);
  }

  public async get(remote: string, options: GitBaseOptions = {}): Promise<Repository> {
    const repoPath = getRepoMainPath(remote);
    if (await this.fs.exists(repoPath)) {
      const repo = await Repository.open(repoPath);
      await this.fetchAll(repo, options);
      return repo;
    } else {
      return this.clone(remote, repoPath, options);
    }
  }

  public async fetchAll(repo: Repository, options: GitBaseOptions) {
    try {
      await repo.fetchAll({
        ...defaultFetchOptions,
        callbacks: {
          credentials: credentialsCallback(options),
        },
      });
    } catch {
      throw new NotFoundException();
    }
  }

  public async clone(remote: string, repoPath: string, options: GitBaseOptions): Promise<Repository> {
    await this.cacheReady;
    try {
      return await Clone.clone(`https://${remote}`, repoPath, {
        fetchOpts: {
          ...defaultFetchOptions,
          callbacks: {
            credentials: credentialsCallback(options),
          },
        },
      });
    } catch {
      throw new NotFoundException();
    }
  }
}

function credentialsCallback(options: GitBaseOptions) {
  return () => {
    if (options.auth) {
      return options.auth.toCreds();
    }
    return undefined;
  };
}
