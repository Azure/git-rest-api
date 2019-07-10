import { ApiModelProperty } from "@nestjs/swagger";

import { GitObjectContent } from "./git-object-content";

export class GitFileObjectWithoutContent extends GitObjectContent {
  @ApiModelProperty({ type: String })
  public encoding: string;

  constructor(gitObjectContent: GitFileObjectWithoutContent) {
    super(gitObjectContent);
    this.encoding = gitObjectContent.encoding;
  }
}
