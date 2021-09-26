import { ApiProperty } from "@nestjs/swagger";

import { GitCommit } from "./git-commit";
import { GitFileDiff } from "./git-file-diff";

export class GitDiff {
  @ApiProperty()
  public headCommit: GitCommit;
  @ApiProperty()
  public baseCommit: GitCommit;
  @ApiProperty()
  public mergeBaseCommit: GitCommit;
  @ApiProperty()
  public totalCommits: number;
  @ApiProperty({ type: GitCommit, isArray: true })
  public commits: GitCommit[];
  @ApiProperty({ type: GitFileDiff, isArray: true })
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
