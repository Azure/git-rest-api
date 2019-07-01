import { Injectable } from "@nestjs/common";
import { from } from "rxjs";
import { exhaustMap, filter } from "rxjs/operators";

import { Logger } from "../../core";
import { DiskUsageService } from "../disk-usage";
import { RepoService } from "../repo";
import { RepoIndexService } from "../repo-index";

@Injectable()
export class RepoCleanupService {
  private logger = new Logger(RepoCleanupService);

  constructor(
    private repoIndexService: RepoIndexService,
    private repoService: RepoService,
    private diskUsageService: DiskUsageService,
  ) {}

  public start() {
    return this.diskUsageService.dataDiskUsage
      .pipe(
        filter(x => {
          const freeRatio = x.available / x.total;
          return freeRatio < 0.1;
        }),
        exhaustMap(() => {
          const count = this.getNumberOfReposToRemove();
          this.logger.info(
            `Disk availability is low. Removing least recently used repos. Total repos: ${this.repoIndexService.size}, Removing: ${count}`,
          );
          const repos = this.repoIndexService.getLeastUsedRepos(count);
          return from(Promise.all(repos.map(x => this.repoService.deleteLocalRepo(x))));
        }),
      )
      .subscribe();
  }

  private getNumberOfReposToRemove() {
    const count = Math.ceil(this.repoIndexService.size / 100);
    return Math.max(Math.min(count, 10), 1);
  }
}
