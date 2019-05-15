import { Controller, Get, Param } from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";

import { GitBranch } from "../../dtos";
import { BranchService } from "../../services";

@Controller("/repos/:remote/branches")
export class BranchesController {
  constructor(private branchService: BranchService) {}

  @Get()
  @ApiOkResponse({ type: GitBranch, isArray: true })
  public async list(@Param("remote") remote: string): Promise<GitBranch[]> {
    const branches = await this.branchService.list(remote);
    return branches;
  }
}
