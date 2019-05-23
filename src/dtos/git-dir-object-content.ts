import { ApiModelProperty } from "@nestjs/swagger";

import { GitObjectContent } from "./git-object-content";

export class GitDirObjectContent extends GitObjectContent {
  @ApiModelProperty({ type: "dir" })
  public type: "dir" = "dir";

  constructor(gitObjectContent: GitDirObjectContent) {
    super(gitObjectContent);
  }
}
