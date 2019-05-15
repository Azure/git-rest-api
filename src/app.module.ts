import { Module } from "@nestjs/common";

import { AppController, BranchesController, HealthCheckController } from "./controllers";
import { AppService, BranchService, FSService, RepoService } from "./services";

@Module({
  imports: [],
  controllers: [AppController, HealthCheckController, BranchesController],
  providers: [AppService, RepoService, FSService, BranchService],
})
export class AppModule {}
