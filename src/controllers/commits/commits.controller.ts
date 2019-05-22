import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitCommit } from "../../dtos";
import { CommitService } from "../../services";

@Controller("/repos/:remote/commits")
export class CommitsController {
  constructor(private commitService: CommitService) {}

  @Get(":commitSha")
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitCommit, isArray: true })
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
