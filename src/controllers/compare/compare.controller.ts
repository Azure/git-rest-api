import { Controller, Get, HttpException, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

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
  @ApiOperation({ title: "Compare two commits", operationId: "commits_compare" })
  public async compare(
    @Param("remote") remote: string,
    @Param("base") base: string,
    @Param("head") head: string,
    @Auth() auth: RepoAuth,
  ) {
    const diff = await this.compareService.compare(remote, base, head, { auth });
    if (diff instanceof HttpException) {
      throw diff;
    }
    return diff;
  }
}
