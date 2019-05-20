import { Module } from "@nestjs/common";

import { Configuration } from "./config";
import { AppController, BranchesController, CommitsController, HealthCheckController } from "./controllers";
import {
  AppService,
  BranchService,
  CommitService,
  FSService,
  GitFetchService,
  HttpService,
  PermissionCacheService,
  PermissionService,
  RepoService,
} from "./services";

@Module({
  imports: [],
  controllers: [AppController, HealthCheckController, BranchesController, CommitsController],
  providers: [
    AppService,
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
