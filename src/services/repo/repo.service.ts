import { Injectable, NotFoundException } from "@nestjs/common";
import { Clone, Fetch, Repository, FetchOptions, Cred } from "nodegit";
import path from "path";

import { FSService } from "../fs";

const repoCacheFolder = path.join("./tmp", "repos");
export function getRepoMainPath(remote: string) {
  return path.join(repoCacheFolder, encodeURIComponent(remote));
}

const defaultFetchOptions: FetchOptions = {
  downloadTags: 0,
  prune: Fetch.PRUNE.GIT_FETCH_PRUNE,
};

@Injectable()
export class RepoService {
  private cacheReady: Promise<string>;
  constructor(private fs: FSService) {
    this.cacheReady = fs.makeDir(repoCacheFolder);
  }

  public async get(remote: string): Promise<Repository> {
    const repoPath = getRepoMainPath(remote);
    if (await this.fs.exists(repoPath)) {
      const repo = await Repository.open(repoPath);
      return repo;
    } else {
      return this.clone(remote, repoPath);
    }
  }

  public async fetchAll(repo: Repository) {
    try {
      await repo.fetchAll(defaultFetchOptions);
    } catch {
      throw new NotFoundException();
    }
  }

  public async clone(remote: string, repoPath: string): Promise<Repository> {
    await this.cacheReady;
    try {
      return await Clone.clone(`https://${remote}`, repoPath, {
        fetchOpts: {
          ...defaultFetchOptions,
          callbacks: {
            credentials: (...args: unknown[]) => {
              console.log("Creds?", args);
              return Cred.userpassPlaintextNew(process.env.GH_TOKEN || "", "x-oauth-basic");
            },
          },
        },
      });
    } catch {
      throw new NotFoundException();
    }
  }
}
