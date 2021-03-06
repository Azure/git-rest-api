import { ApiModelProperty } from "@nestjs/swagger";

import { GitDirObjectContent } from "./git-dir-object-content";
import { GitFileObjectWithContent } from "./git-file-object-with-content";
import { GitSubmoduleObjectContent } from "./git-submodule-object-content";

export class GitTree {
  @ApiModelProperty({ type: GitDirObjectContent, isArray: true })
  public dirs: GitDirObjectContent[];
  @ApiModelProperty({ type: GitFileObjectWithContent, isArray: true })
  public files: GitFileObjectWithContent[];
  @ApiModelProperty({ type: GitSubmoduleObjectContent, isArray: true })
  public submodules: GitSubmoduleObjectContent[];

  constructor(gitObjectContent: GitTree) {
    this.dirs = gitObjectContent.dirs;
    this.files = gitObjectContent.files;
    this.submodules = gitObjectContent.submodules;
  }
}
