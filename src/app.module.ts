import { Module } from "@nestjs/common";

import { AppController, BranchesController, HealthCheckController } from "./controllers";
import {
  AppService,
  BranchService,
  FSService,
  PermissionService,
  RepoService,
  PermissionCacheService,
} from "./services";
import { GitFetchService } from "./services/git-fetch";

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
  ],
})
export class AppModule {}
