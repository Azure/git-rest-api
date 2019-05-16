import { Controller, Get, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitBranch } from "../../dtos";
import { BranchService } from "../../services";

@Controller("/repos/:remote/branches")
export class BranchesController {
  constructor(private branchService: BranchService) {}

  @Get()
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitBranch, isArray: true })
  @ApiNotFoundResponse({})
  public async list(@Param("remote") remote: string, @Auth() auth: RepoAuth): Promise<GitBranch[]> {
    const branches = await this.branchService.list(remote, { auth });
    return branches;
  }
}
