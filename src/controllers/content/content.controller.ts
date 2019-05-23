import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitObjectContent } from "../../dtos/git-object-content";
import { ContentService } from "../../services/content";

@Controller("/repos/:remote/contents")
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get([":path([^/]*)", "*"])
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitObjectContent, isArray: true })
  @ApiNotFoundResponse({})
  public async compare(
    @Param("remote") remote: string,
    @Param("path") path: string | undefined,
    @Query("ref") ref: string | undefined,
    @Auth() auth: RepoAuth,
  ) {
    const content = await this.contentService.getContents(remote, path, ref, { auth });
    if (content instanceof HttpException) {
      throw content;
    }
    return content;
  }
}
