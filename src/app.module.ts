import { Module } from "@nestjs/common";

import { Configuration } from "./config";
import {
  AppController,
  BranchesController,
  HealthCheckController
} from "./controllers";
import {
  AppService,
  BranchService,
  FSService,
  GitFetchService,
  HttpService,
  PermissionCacheService,
  PermissionService,
  RepoService
} from "./services";

@Module({
  imports: [],
  controllers: [AppController, HealthCheckController, BranchesController],
  providers: [
    AppService,
    RepoService,
    FSService,
    BranchService,
    PermissionService,
    GitFetchService,
    PermissionCacheService,
    HttpService,
    Configuration
  ]
})
export class AppModule {}
