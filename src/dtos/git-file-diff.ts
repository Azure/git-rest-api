import { ApiModelProperty, ApiModelPropertyOptional } from "@nestjs/swagger";

export enum PatchStatus {
  Unmodified = "unmodified",
  Modified = "modified",
  Added = "added",
  Deleted = "deleted",
  Renamed = "renamed",
}

export interface IGitFileDiff {
  filename: string;
  sha: string;
  status: PatchStatus;
  additions: number;
  deletions: number;
  changes: number;
  previousFilename?: string;
}

export class GitFileDiff implements IGitFileDiff {
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

  constructor(obj: IGitFileDiff) {
    this.filename = obj.filename;
    this.sha = obj.sha;
    this.status = obj.status;
    this.additions = obj.additions;
    this.deletions = obj.deletions;
    this.changes = obj.changes;
    this.previousFilename = obj.previousFilename;
  }
}
