import { Controller, Get, Param } from "@nestjs/common";

import { Auth, RepoAuth } from "../../core";

console.log("Dis4");
@Controller("/repos/:remote/compare")
export class CompareController {
  @Get(":base...:head")
  public compare(
    @Param("remote") remote: string,
    @Param("base") base: string,
    @Param("head") head: string,
    @Auth() auth: RepoAuth,
  ) {
    return `${remote}.${base}.${head}`;
  }
}
