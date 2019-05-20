import { ApiModelProperty } from "@nestjs/swagger";

import { GitCommit, IGitCommit } from "./git-commit";
import { GitFileDiff, IGitFileDiff } from "./git-file-diff";

export interface IGitDiff {
  headCommit: IGitCommit;
  baseCommit: IGitCommit;
  mergeBaseCommit: IGitCommit;
  files: IGitFileDiff[];
}

export class GitDiff implements IGitDiff {
  @ApiModelProperty()
  public headCommit: GitCommit;
  @ApiModelProperty()
  public baseCommit: GitCommit;
  @ApiModelProperty()
  public mergeBaseCommit: GitCommit;
  @ApiModelProperty({ type: GitFileDiff, isArray: true })
  public files: GitFileDiff[];

  constructor(obj: IGitDiff) {
    this.headCommit = obj.headCommit;
    this.baseCommit = obj.baseCommit;
    this.mergeBaseCommit = obj.mergeBaseCommit;
    this.files = obj.files.map(x => new GitFileDiff(x));
  }
}
