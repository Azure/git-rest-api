import { ApiProperty } from "@nestjs/swagger";

import { GitCommitRef } from "./git-commit-ref";
import { GitSignature } from "./git-signature";

export class GitCommit extends GitCommitRef {
  @ApiProperty({ type: String })
  public message: string;

  @ApiProperty({ type: GitSignature })
  public author: GitSignature;

  @ApiProperty({ type: GitSignature })
  public committer: GitSignature;

  @ApiProperty({ type: GitCommitRef, isArray: true })
  public parents: GitCommitRef[];

  constructor(commit: GitCommit) {
    super(commit);
    this.message = commit.message;
    this.author = commit.author;
    this.committer = commit.committer;
    this.parents = commit.parents.map(x => new GitCommitRef(x));
  }
}
