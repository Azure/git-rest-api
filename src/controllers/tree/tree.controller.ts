import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { ApiImplicitQuery, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitTree } from "../../dtos";
import { ContentService } from "../../services/content";

@Controller("/repos/:remote/tree")
export class TreeController {
  constructor(private contentService: ContentService) {}

  @Get([":path([^/]*)", ""])
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitTree })
  @ApiImplicitQuery({ name: "ref", required: false, type: "string" })
  @ApiOperation({ title: "Get tree", operationId: "tree_get" })
  @ApiImplicitQuery({ name: "path", required: false, type: "string" })
  @ApiNotFoundResponse({})
  public async getTree(
    @Param("remote") remote: string,
    @Param("path") path: string | undefined,
    @Query("ref") ref: string | undefined,
    @Auth() auth: RepoAuth,
  ) {
    const tree = await this.contentService.getContents(remote, path, ref, true, false, { auth });
    if (tree instanceof HttpException) {
      throw tree;
    }
    return tree;
  }
}
