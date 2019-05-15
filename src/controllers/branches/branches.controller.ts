import { Controller, Get, Param } from "@nestjs/common";

import { BranchService } from "../../services";

@Controller("/repos/:remote/branches")
export class BranchesController {
  constructor(private branchService: BranchService) {}
  @Get()
  public async list(@Param("remote") remote: string) {
    const branches = await this.branchService.list(remote);
    return branches;
  }
}
