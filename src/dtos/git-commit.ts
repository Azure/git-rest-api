import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommitRef, IGitCommitRef } from "./git-commit-ref";
import { GitSignature, IGitSignature } from "./git-signature";

export interface IGitCommit extends IGitCommitRef {
  sha: string;
  message: string;
  author: IGitSignature;
  committer: IGitSignature;
  parents: IGitCommitRef[];
}

export class GitCommit extends GitCommitRef implements IGitCommit {
  @ApiModelProperty({ type: String })
  public message: string;

  @ApiModelProperty({ type: GitSignature })
  public author: GitSignature;

  @ApiModelProperty({ type: GitSignature })
  public committer: GitSignature;

  @ApiModelProperty({ type: GitCommit, isArray: true })
  public parents: GitCommitRef[];

  constructor(commit: IGitCommit) {
    super(commit);
    this.message = commit.message;
    this.author = commit.author;
    this.committer = commit.committer;
    this.parents = commit.parents.map(x => new GitCommitRef(x));
  }
}
