import { Module } from "@nestjs/common";

import { Configuration } from "./config";
import {
  BranchesController,
  CommitsController,
  CompareController,
  ContentController,
  HealthCheckController,
} from "./controllers";
import {
  AppService,
  BranchService,
  CommitService,
  CompareService,
  FSService,
  GitFetchService,
  HttpService,
  PermissionCacheService,
  PermissionService,
  RepoService,
} from "./services";
import { ContentService } from "./services/content";

@Module({
  imports: [],
  controllers: [HealthCheckController, BranchesController, CommitsController, CompareController, ContentController],
  providers: [
    AppService,
    CompareService,
    RepoService,
    FSService,
    BranchService,
    PermissionService,
    GitFetchService,
    PermissionCacheService,
    HttpService,
    Configuration,
    CommitService,
    ContentService,
  ],
})
export class AppModule {}
