import { ApiModelProperty } from "@nestjs/swagger";

import { GitObjectContent } from "./git-object-content";

export class GitFileObjectContent extends GitObjectContent {
  @ApiModelProperty({ type: String, required: false })
  public content?: string;
  @ApiModelProperty({ type: String })
  public encoding: string;

  constructor(gitObjectContent: GitFileObjectContent) {
    super(gitObjectContent);
    this.content = gitObjectContent.content;
    this.encoding = gitObjectContent.encoding;
  }
}
