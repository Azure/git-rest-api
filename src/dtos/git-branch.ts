import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommit, IGitCommit } from "./git-commit";

export interface IGitBranch {
  name: string;
  commit: IGitCommit;
}

export class GitBranch implements IGitBranch {
  @ApiModelProperty({ type: String })
  public name: string;

  @ApiModelProperty({ type: GitCommit })
  public commit: GitCommit;

  constructor(branch: IGitBranch) {
    this.name = branch.name;
    this.commit = new GitCommit(branch.commit);
  }
}
