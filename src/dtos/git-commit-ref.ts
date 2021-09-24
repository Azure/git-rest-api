import { ApiProperty } from "@nestjs/swagger";

export class GitCommitRef {
  @ApiProperty({ type: String })
  public sha: string;

  constructor(commit: GitCommitRef) {
    this.sha = commit.sha;
  }
}
