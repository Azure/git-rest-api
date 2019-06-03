import { Controller, Get, NotFoundException, Param, Query, Res } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiImplicitQuery } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitCommit } from "../../dtos";
import { CommitService } from "../../services";
import { applyPaginatedResponse } from "../../core/pagination";
import { Response } from "express";

@Controller("/repos/:remote/commits")
export class CommitsController {
  constructor(private commitService: CommitService) {}

  @Get()
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitCommit, isArray: true })
  @ApiNotFoundResponse({})
  @ApiOperation({ title: "List commits", operationId: "commits_list" })
  @ApiImplicitQuery({
    name: "ref",
    required: false,
    description: "Reference to list the commits from. Can be a branch or a commit. Default to master",
    type: String,
  })
  public async list(
    @Param("remote") remote: string,
    @Query("ref") ref: string | undefined,
    @Auth() auth: RepoAuth,
    @Res() response: Response,
  ) {
    const commits = await this.commitService.list(remote, { auth, ref });
    if (commits instanceof NotFoundException) {
      throw commits;
    }
    return applyPaginatedResponse(commits, response);
  }

  @Get(":commitSha")
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitCommit })
  @ApiNotFoundResponse({})
  @ApiOperation({ title: "Get a commit", operationId: "commits_get" })
  public async get(@Param("remote") remote: string, @Param("commitSha") commitSha: string, @Auth() auth: RepoAuth) {
    const commit = await this.commitService.get(remote, commitSha, { auth });

    if (!commit) {
      throw new NotFoundException(`Commit with sha ${commitSha} was not found`);
    }
    return commit;
  }
}
