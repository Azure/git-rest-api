import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommitRef } from "./git-commit-ref";
import { GitSignature } from "./git-signature";

export class GitCommit extends GitCommitRef {
  @ApiModelProperty({ type: String })
  public message: string;

  @ApiModelProperty({ type: GitSignature })
  public author: GitSignature;

  @ApiModelProperty({ type: GitSignature })
  public committer: GitSignature;

  @ApiModelProperty({ type: GitCommitRef, isArray: true })
  public parents: GitCommitRef[];

  constructor(commit: GitCommit) {
    super(commit);
    this.message = commit.message;
    this.author = commit.author;
    this.committer = commit.committer;
    this.parents = commit.parents.map(x => new GitCommitRef(x));
  }
}
