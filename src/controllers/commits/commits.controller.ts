import { Controller, Get, Param } from "@nestjs/common";

import { Auth, RepoAuth } from "../../core";
import { CommitService } from "../../services";

@Controller("/repos/:remote/commits")
export class CommitsController {
  constructor(private commitService: CommitService) {}

  @Get(":commitSha")
  public get(@Param("remote") remote: string, @Param("commitSha") commitSha: string, @Auth() auth: RepoAuth) {
    return this.commitService.get(remote, commitSha, { auth });
  }
}
