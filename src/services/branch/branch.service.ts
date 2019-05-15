import { Injectable } from "@nestjs/common";
import { Commit, Object as GitObject, Reference } from "nodegit";

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
    const branches = refs.filter(x => x.isBranch());

    return Promise.all(
      branches.map(async ref => {
        const target = await ref.peel(GitObject.TYPE.COMMIT);
        const commit = await Commit.lookup(repo, target.id());
        return {
          name: getBranchName(ref.name()),
          commit: {
            sha: commit.sha(),
          },
        } as any;
      }),
    );
  }
}

export function getBranchName(refName: string) {
  const prefix = "refs/heads/";
  return refName.slice(prefix.length);
}
