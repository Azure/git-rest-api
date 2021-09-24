import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { ApiModelEnum } from "../core";

export enum PatchStatus {
  Unmodified = "unmodified",
  Modified = "modified",
  Added = "added",
  Deleted = "deleted",
  Renamed = "renamed",
}

export class GitFileDiff {
  @ApiProperty()
  public filename: string;
  @ApiProperty()
  public sha: string;
  @ApiModelEnum({ PatchStatus })
  public status: PatchStatus;
  @ApiProperty()
  public additions: number;
  @ApiProperty()
  public deletions: number;
  @ApiProperty()
  public changes: number;
  @ApiPropertyOptional()
  public previousFilename?: string;

  constructor(obj: GitFileDiff) {
    this.filename = obj.filename;
    this.sha = obj.sha;
    this.status = obj.status;
    this.additions = obj.additions;
    this.deletions = obj.deletions;
    this.changes = obj.changes;
    this.previousFilename = obj.previousFilename;
  }
}
