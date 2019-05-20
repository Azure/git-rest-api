import { ApiModelProperty } from "@nestjs/swagger";

export interface IGitCommitRef {
  sha: string;
}

export class GitCommitRef implements IGitCommitRef {
  @ApiModelProperty({ type: String })
  public sha: string;

  constructor(commit: IGitCommitRef) {
    this.sha = commit.sha;
  }
}
