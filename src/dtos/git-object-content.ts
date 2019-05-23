import { ApiModelProperty } from "@nestjs/swagger";

export class GitObjectContent {
  @ApiModelProperty({ type: String })
  public type: string;
  @ApiModelProperty({ type: Number })
  public size: number;
  @ApiModelProperty({ type: String })
  public name: string;
  @ApiModelProperty({ type: String })
  public path: string;
  @ApiModelProperty({ type: String })
  public sha: string;

  constructor(gitObjectContent: GitObjectContent) {
    this.type = gitObjectContent.type;
    this.size = gitObjectContent.size;
    this.name = gitObjectContent.name;
    this.path = gitObjectContent.path;
    this.sha = gitObjectContent.sha;
  }
}
