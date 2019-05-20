import { ApiModelProperty, ApiModelPropertyOptional } from "@nestjs/swagger";

export enum PatchStatus {
  Unmodified = "unmodified",
  Modified = "modified",
  Added = "added",
  Deleted = "deleted",
  Renamed = "renamed",
}

export class GitFileDiff {
  @ApiModelProperty()
  public filename: string;
  @ApiModelProperty()
  public sha: string;
  @ApiModelProperty({ enum: PatchStatus })
  public status: PatchStatus;
  @ApiModelProperty()
  public additions: number;
  @ApiModelProperty()
  public deletions: number;
  @ApiModelProperty()
  public changes: number;
  @ApiModelPropertyOptional()
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
