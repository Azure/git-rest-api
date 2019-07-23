import { ApiModelProperty } from "@nestjs/swagger";

import { GitDirObjectContent } from "./git-dir-object-content";
import { GitFileObjectWithoutContent } from "./git-file-object-without-content";
import { GitSubmoduleObjectContent } from "./git-submodule-object-content";

export class GitContents {
  @ApiModelProperty({ type: GitDirObjectContent, isArray: true })
  public dirs: GitDirObjectContent[];
  @ApiModelProperty({ type: GitFileObjectWithoutContent, isArray: true })
  public files: GitFileObjectWithoutContent[];
  @ApiModelProperty({ type: GitSubmoduleObjectContent, isArray: true })
  public submodules: GitSubmoduleObjectContent[];

  constructor(gitObjectContent: GitContents) {
    this.dirs = gitObjectContent.dirs;
    this.files = gitObjectContent.files;
    this.submodules = gitObjectContent.submodules;
  }
}
