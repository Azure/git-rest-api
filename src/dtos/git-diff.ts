import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommit } from "./git-commit";
import { GitFileDiff } from "./git-file-diff";

export class GitDiff {
  @ApiModelProperty()
  public headCommit: GitCommit;
  @ApiModelProperty()
  public baseCommit: GitCommit;
  @ApiModelProperty()
  public mergeBaseCommit: GitCommit;
  @ApiModelProperty()
  public totalCommits: number;
  @ApiModelProperty({ type: GitCommit, isArray: true })
  public commits: GitCommit[];
  @ApiModelProperty({ type: GitFileDiff, isArray: true })
  public files: GitFileDiff[];

  constructor(obj: GitDiff) {
    this.headCommit = obj.headCommit;
    this.baseCommit = obj.baseCommit;
    this.mergeBaseCommit = obj.mergeBaseCommit;
    this.totalCommits = obj.totalCommits;
    this.commits = obj.commits;
    this.files = obj.files.map(x => new GitFileDiff(x));
  }
}
