import { ApiProperty } from "@nestjs/swagger";

export class GitSignature {
  @ApiProperty({ type: String })
  public name: string;
  @ApiProperty({ type: String })
  public email: string;
  @ApiProperty({ type: String, format: "date-time" })
  public date: Date;

  constructor(sig: GitSignature) {
    this.name = sig.name;
    this.email = sig.email;
    this.date = sig.date;
  }
}
