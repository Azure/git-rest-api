import { Controller, Get, Headers, Param } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";

import { GitBranch } from "../../dtos";
import { BranchService } from "../../services";

@Controller("/repos/:remote/branches")
export class BranchesController {
  constructor(private branchService: BranchService) {}

  @Get()
  @ApiOkResponse({ type: GitBranch, isArray: true })
  @ApiNotFoundResponse({})
  public async list(
    @Param("remote") remote: string,
    @Headers("x-oauth-basic") oAuthToken: string,
  ): Promise<GitBranch[]> {
    const branches = await this.branchService.list(remote);
    return branches;
  }
}
