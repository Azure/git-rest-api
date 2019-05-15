import { Injectable } from "@nestjs/common";
import { Reference } from "nodegit";

import { GitBranch } from "../../dtos";
import { RepoService } from "../repo";

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
        return new GitBranch({
          name: getBranchName(ref.name()),
          commit: {
            sha: target.toString(),
          },
        });
      }),
    );
  }
}

export function getBranchName(refName: string) {
  const prefix = "refs/remotes/origin/";
  return refName.slice(prefix.length);
}
