import { ApiProperty } from "@nestjs/swagger";

import { GitDirObjectContent } from "./git-dir-object-content";
import { GitFileObjectWithContent } from "./git-file-object-with-content";
import { GitSubmoduleObjectContent } from "./git-submodule-object-content";

export class GitTree {
  @ApiProperty({ type: GitDirObjectContent, isArray: true })
  public dirs: GitDirObjectContent[];
  @ApiProperty({ type: GitFileObjectWithContent, isArray: true })
  public files: GitFileObjectWithContent[];
  @ApiProperty({ type: GitSubmoduleObjectContent, isArray: true })
  public submodules: GitSubmoduleObjectContent[];

  constructor(gitObjectContent: GitTree) {
    this.dirs = gitObjectContent.dirs;
    this.files = gitObjectContent.files;
    this.submodules = gitObjectContent.submodules;
  }
}
