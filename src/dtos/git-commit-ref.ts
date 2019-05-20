import { ApiModelProperty } from "@nestjs/swagger";

export class GitCommitRef {
  @ApiModelProperty({ type: String })
  public sha: string;

  constructor(commit: GitCommitRef) {
    this.sha = commit.sha;
  }
}
