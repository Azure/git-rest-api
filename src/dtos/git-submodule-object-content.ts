import { ApiModelProperty } from "@nestjs/swagger";

import { GitObjectContent } from "./git-object-content";

export class GitSubmoduleObjectContent extends GitObjectContent {
  @ApiModelProperty({ type: "submodule" })
  public type: "submodule" = "submodule";

  constructor(gitObjectContent: GitSubmoduleObjectContent) {
    super(gitObjectContent);
  }
}
