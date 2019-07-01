import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { Connection } from "typeorm";

import { Configuration } from "./config";
import {
  BranchesController,
  CommitsController,
  CompareController,
  ContentController,
  HealthCheckController,
} from "./controllers";
import { Telemetry, createTelemetry } from "./core";
import { ContextMiddleware, LoggingInterceptor } from "./middlewares";
import {
  AppService,
  BranchService,
  CommitService,
  CompareService,
  ContentService,
  DiskUsageService,
  FSService,
  HttpService,
  PermissionCacheService,
  PermissionService,
  RepoCleanupService,
  RepoService,
  createDBConnection,
} from "./services";
import { RepoIndexService } from "./services/repo-index";

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
    PermissionCacheService,
    HttpService,
    Configuration,
    CommitService,
    ContentService,
    DiskUsageService,
    RepoIndexService,
    RepoCleanupService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: Telemetry,
      useFactory: (config: Configuration) => createTelemetry(config),
      inject: [Configuration],
    },
    {
      provide: Connection,
      useFactory: (config: Configuration) => createDBConnection(config),
      inject: [Configuration],
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private diskUsage: DiskUsageService, private repoCleanupService: RepoCleanupService) {}
  public configure(consumer: MiddlewareConsumer) {
    this.diskUsage.startCollection();
    this.repoCleanupService.start();

    consumer.apply(ContextMiddleware).forRoutes("*");
  }
}
