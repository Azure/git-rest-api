import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { APP_INTERCEPTOR } from "@nestjs/core";

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
  GitFetchService,
  HttpService,
  PermissionCacheService,
  PermissionService,
  RepoService,
} from "./services";

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
    DiskUsageService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: Telemetry,
      useFactory: (config: Configuration) => createTelemetry(config),
      inject: [Configuration],
    },
  ],
})
export class AppModule implements NestModule {
  constructor(private diskUsage: DiskUsageService) {}
  public configure(consumer: MiddlewareConsumer) {
    this.diskUsage.startCollection();
    consumer.apply(ContextMiddleware).forRoutes("*");
  }
}
