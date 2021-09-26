import { ApiProperty } from "@nestjs/swagger";

import { GitFileObjectWithoutContent } from "./git-file-object-without-content";

export class GitFileObjectWithContent extends GitFileObjectWithoutContent {
  @ApiProperty({ type: String })
  public content: string;

  constructor(gitObjectContent: GitFileObjectWithContent) {
    super(gitObjectContent);
    this.content = gitObjectContent.content;
  }
}
