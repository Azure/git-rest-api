import { ApiModelProperty } from "@nestjs/swagger";

export interface IGitCommit {
  sha: string;
}

export class GitCommit implements IGitCommit {
  @ApiModelProperty({ type: String })
  public sha: string;

  constructor(commit: { sha: string }) {
    this.sha = commit.sha;
  }
}
