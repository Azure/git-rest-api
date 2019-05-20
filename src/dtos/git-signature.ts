import { ApiModelProperty } from "@nestjs/swagger";

export class GitSignature {
  @ApiModelProperty({ type: String })
  public name: string;
  @ApiModelProperty({ type: String })
  public email: string;
  @ApiModelProperty({ type: String, format: "date-time" })
  public date: Date;

  constructor(sig: GitSignature) {
    this.name = sig.name;
    this.email = sig.email;
    this.date = sig.date;
  }
}
