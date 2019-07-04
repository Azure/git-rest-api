import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { ApiImplicitQuery, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitContents } from "../../dtos/git-contents";
import { ContentService } from "../../services/content";

@Controller("/repos/:remote/tree")
export class TreeController {
  constructor(private contentService: ContentService) {}

  @Get([":path([^/]*)", "*"])
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitContents })
  @ApiImplicitQuery({ name: "ref", required: false, type: "string" })
  @ApiOperation({ title: "Get tree", operationId: "tree_get" })
  @ApiNotFoundResponse({})
  public async getTree(
    @Param("remote") remote: string,
    @Param("path") path: string | undefined,
    @Query("ref") ref: string | undefined,
    @Auth() auth: RepoAuth,
  ) {
    const content = await this.contentService.getContents(remote, path, ref, true, false, { auth });
    if (content instanceof HttpException) {
      throw content;
    }
    return content;
  }
}
