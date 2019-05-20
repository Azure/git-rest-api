import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommitRef } from "./git-commit-ref";

export class GitBranch {
  @ApiModelProperty({ type: String })
  public name: string;

  @ApiModelProperty({ type: GitCommitRef })
  public commit: GitCommitRef;

  constructor(branch: GitBranch) {
    this.name = branch.name;
    this.commit = new GitCommitRef(branch.commit);
  }
}
