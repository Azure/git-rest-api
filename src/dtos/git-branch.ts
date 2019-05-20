import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommitRef, IGitCommitRef } from "./git-commit-ref";

export interface IGitBranch {
  name: string;
  commit: IGitCommitRef;
}

export class GitBranch implements IGitBranch {
  @ApiModelProperty({ type: String })
  public name: string;

  @ApiModelProperty({ type: GitCommitRef })
  public commit: GitCommitRef;

  constructor(branch: IGitBranch) {
    this.name = branch.name;
    this.commit = new GitCommitRef(branch.commit);
  }
}
