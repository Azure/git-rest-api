import { Controller, Get, HttpException, Param, Query } from "@nestjs/common";
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";

import { ApiHasPassThruAuth, Auth, RepoAuth } from "../../core";
import { GitContents } from "../../dtos";
import { ContentService } from "../../services/content";
import { parseBooleanFromURLParam } from "../../utils";

@Controller("/repos/:remote/contents")
export class ContentController {
  constructor(private contentService: ContentService) {}

  @Get([":path([^/]*)", ""])
  @ApiHasPassThruAuth()
  @ApiOkResponse({ type: GitContents })
  @ApiQuery({ name: "ref", required: false, type: "string" })
  @ApiQuery({ name: "recursive", required: false, type: "string" })
  @ApiParam({ name: "path", type: "string" })
  @ApiOperation({ summary: "Get content", operationId: "contents_get" })
  @ApiNotFoundResponse({})
  public async getContents(
    @Param("remote") remote: string,
    @Param("path") path: string | undefined,
    @Query("ref") ref: string | undefined,
    @Query("recursive") recursive: string | undefined,
    @Auth() auth: RepoAuth,
  ) {
    const content = await this.contentService.getContents(
      remote,
      path,
      ref,
      parseBooleanFromURLParam(recursive),
      true,
      {
        auth,
      },
    );
    if (content instanceof HttpException) {
      throw content;
    }
    return content;
  }
}
