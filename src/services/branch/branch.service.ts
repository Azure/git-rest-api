import { Injectable } from "@nestjs/common";
import { Reference } from "nodegit";

import { RepoService } from "../repo";

export interface GitBranch {
  name: string;
  commit: {
    sha: string;
  };
}

@Injectable()
export class BranchService {
  constructor(private repoService: RepoService) {}

  /**
   * List the branches
   * @param remote
   */
  public async list(remote: string): Promise<GitBranch[]> {
    const repo = await this.repoService.get(remote);
    const refs = await repo.getReferences(Reference.TYPE.LISTALL);
    const branches = refs.filter(x => x.isRemote());

    return Promise.all(
      branches.map(async ref => {
        const target = await ref.target();
        return {
          name: getBranchName(ref.name()),
          commit: {
            sha: target.toString(),
          },
        } as any;
      }),
    );
  }
}

export function getBranchName(refName: string) {
  const prefix = "refs/remotes/origin/";
  return refName.slice(prefix.length);
}
