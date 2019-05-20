import { Controller, Get, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitDiff } from "../../dtos/git-diff";
import { CompareService } from "../../services";

@Controller("/repos/:remote/compare")
export class CompareController {
  constructor(private compareService: CompareService) {}

  @Get(":base...:head")
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitDiff, isArray: true })
  @ApiNotFoundResponse({})
  public compare(
    @Param("remote") remote: string,
    @Param("base") base: string,
    @Param("head") head: string,
    @Auth() auth: RepoAuth,
  ) {
    return this.compareService.compare(remote, base, head, { auth });
  }
}