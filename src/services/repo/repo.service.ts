import { Injectable } from "@nestjs/common";
import { Clone, Fetch, Repository } from "nodegit";
import path from "path";

import { FSService } from "../fs";

const repoCacheFolder = path.join("./tmp", "repos");
export function getRepoMainPath(remote: string) {
  return path.join(repoCacheFolder, encodeURIComponent(remote));
}

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
      await repo.fetchAll({
        prune: Fetch.PRUNE.GIT_FETCH_PRUNE,
      });
      return repo;
    } else {
      return this.clone(remote, repoPath);
    }
  }

  public async clone(remote: string, repoPath: string): Promise<Repository> {
    await this.cacheReady;
    return Clone.clone(`https://${remote}`, repoPath);
  }
}
