import { ApiProperty } from "@nestjs/swagger";

export class GitObjectContent {
  @ApiProperty({ type: String })
  public type: string;
  @ApiProperty({ type: Number })
  public size: number;
  @ApiProperty({ type: String })
  public name: string;
  @ApiProperty({ type: String })
  public path: string;
  @ApiProperty({ type: String })
  public sha: string;

  constructor(gitObjectContent: GitObjectContent) {
    this.type = gitObjectContent.type;
    this.size = gitObjectContent.size;
    this.name = gitObjectContent.name;
    this.path = gitObjectContent.path;
    this.sha = gitObjectContent.sha;
  }
}
