import { Module } from "@nestjs/common";

import { Configuration } from "./config";
import { AppController, BranchesController, HealthCheckController } from "./controllers";
import { AppService, BranchService, FSService, PermissionService, RepoService } from "./services";

@Module({
  imports: [],
  controllers: [AppController, HealthCheckController, BranchesController],
  providers: [AppService, RepoService, FSService, BranchService, PermissionService, Configuration],
})
export class AppModule {}
