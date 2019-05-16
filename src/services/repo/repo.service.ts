import { Injectable } from "@nestjs/common";
import { Repository } from "nodegit";
import path from "path";

import { RepoAuth } from "../../core";
import { FSService } from "../fs";
import { GitFetchService, repoCacheFolder} from "../git-fetch";

export function getRepoMainPath(remote: string) {
  return path.join(repoCacheFolder, encodeURIComponent(remote));
}

export interface GitBaseOptions {
  auth?: RepoAuth;
}

@Injectable()
export class RepoService {
  constructor(private fs: FSService, private fetchService: GitFetchService) {}

  public async get(remote: string, options: GitBaseOptions = {}): Promise<Repository> {
    const repoPath = getRepoMainPath(remote);

    if (await this.fs.exists(repoPath)) {
      const repo = await Repository.open(repoPath);
      return this.fetchService.fetch(remote, repo, options);
    } else {
      return this.fetchService.clone(remote, repoPath, options);
    }
  }
}
