import { ApiModelProperty } from "@nestjs/swagger";

export interface IGitSignature {
  name: string;
  email: string;
  date: Date;
}

export class GitSignature implements IGitSignature {
  @ApiModelProperty({ type: String })
  public name: string;
  @ApiModelProperty({ type: String })
  public email: string;
  @ApiModelProperty({ type: String, format: "date-time" })
  public date: Date;

  constructor(sig: IGitSignature) {
    this.name = sig.name;
    this.email = sig.email;
    this.date = sig.date;
  }
}
