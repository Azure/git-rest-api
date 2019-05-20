import { Module } from "@nestjs/common";

import { Configuration } from "./config";
import {
  AppController,
  BranchesController,
  CommitsController,
  CompareController,
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

@Module({
  imports: [],
  controllers: [AppController, HealthCheckController, BranchesController, CommitsController, CompareController],
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
  ],
})
export class AppModule {}
