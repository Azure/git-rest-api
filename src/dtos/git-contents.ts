import { ApiModelProperty } from "@nestjs/swagger";

import { GitDirObjectContent } from "./git-dir-object-content";
import { GitFileObjectContent } from "./git-file-object-content";
import { GitSubmoduleObjectContent } from "./git-submodule-object-content";

export class GitContents {
  @ApiModelProperty({ type: GitDirObjectContent, isArray: true })
  public dirs: GitDirObjectContent[];
  @ApiModelProperty({ type: GitFileObjectContent, isArray: true })
  public files: GitFileObjectContent[];
  @ApiModelProperty({ type: GitSubmoduleObjectContent, isArray: true })
  public submodules: GitSubmoduleObjectContent[];

  constructor(gitObjectContent: GitContents) {
    this.dirs = gitObjectContent.dirs;
    this.files = gitObjectContent.files;
    this.submodules = gitObjectContent.submodules;
  }
}
