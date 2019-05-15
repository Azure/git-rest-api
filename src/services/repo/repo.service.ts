import { Injectable } from "@nestjs/common";
import { Clone, Repository } from "nodegit";
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
    // tslint:disable-next-line: no-empty
    if (await this.fs.exists(repoPath)) {
      return Repository.open(repoPath);
    } else {
      return this.clone(remote, repoPath);
    }
  }

  public async clone(remote: string, repoPath: string): Promise<Repository> {
    await this.cacheReady;
    return Clone.clone(`https://${remote}`, repoPath);
  }
}
