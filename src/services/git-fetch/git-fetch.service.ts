import { Injectable, NotFoundException } from "@nestjs/common";
import { Clone, Fetch, FetchOptions, Repository } from "nodegit";
import path from "path";

import { FSService } from "../fs";
import { GitBaseOptions } from "../repo";

export function credentialsCallback(options: GitBaseOptions) {
  return () => {
    if (options.auth) {
      return options.auth.toCreds();
    }
    return undefined;
  };
}

export const defaultFetchOptions: FetchOptions = {
  downloadTags: 0,
  prune: Fetch.PRUNE.GIT_FETCH_PRUNE,
};
export const repoCacheFolder = path.join("./tmp", "repos");

const FETCH_TIMEOUT = 30_000; // 30s;

@Injectable()
export class GitFetchService {
  private currentFetches = new Map<string, Promise<Repository>>();
  private lastFetch = new Map<string, number>();

  private cacheReady: Promise<string>;

  constructor(fs: FSService) {
    this.cacheReady = fs.mkdir(repoCacheFolder);
  }

  public async fetch(id: string, repo: Repository, options: GitBaseOptions): Promise<Repository> {
    if (await this.needToFetch(id)) {
      return this.ensureSingleFetch(id, () => this.fetchAll(id, repo, options).then(() => repo));
    }
    return repo;
  }

  private ensureSingleFetch(id: string, callback: () => Promise<Repository>): Promise<Repository> {
    let promise = this.currentFetches.get(id);

    if (!promise) {
      promise = callback().then(repo => {
        this.currentFetches.delete(id);
        return repo;
      });
      this.currentFetches.set(id, promise);
    }
    return promise;
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

  private async fetchAll(remote: string, repo: Repository, options: GitBaseOptions) {
    try {
      await repo.fetchAll({
        ...defaultFetchOptions,
        callbacks: {
          credentials: credentialsCallback(options),
        },
      });
      this.lastFetch.set(remote, new Date().getTime());
    } catch {
      throw new NotFoundException();
    }
  }

  /**
   * If we need to fetch the given remote
   */
  private async needToFetch(remote: string): Promise<boolean> {
    const lastFetch = this.lastFetch.get(remote);
    if (!lastFetch) {
      return true;
    }
    const now = new Date().getTime();
    return now - lastFetch > FETCH_TIMEOUT;
  }
}
