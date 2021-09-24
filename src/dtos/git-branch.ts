import { ApiProperty  } from "@nestjs/swagger";

import { GitCommitRef } from "./git-commit-ref";

export class GitBranch {
  @ApiProperty({ type: String })
  public name: string;

  @ApiProperty({ type: GitCommitRef })
  public commit: GitCommitRef;

  constructor(branch: GitBranch) {
    this.name = branch.name;
    this.commit = new GitCommitRef(branch.commit);
  }
}
