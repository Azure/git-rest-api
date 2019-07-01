import { Injectable } from "@nestjs/common";
import { from, of } from "rxjs";
import { catchError, delay, exhaustMap, filter } from "rxjs/operators";

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
          if (this.repoIndexService.size === 0) {
            this.logger.error("There isn't any repo cached on disk. Space is most likely used by something else.");
          }
          const total = this.repoIndexService.size;
          this.logger.warning(
            `Disk availability is low. Removing least recently used repos. Total repos: ${total}, Removing: ${count}`,
          );
          const repos = this.repoIndexService.getLeastUsedRepos(count);
          return from(Promise.all(repos.map(x => this.repoService.deleteLocalRepo(x)))).pipe(
            delay(2000),
            catchError(error => {
              this.logger.error("Error occured when deleting repos", { error });
              return of(undefined);
            }),
          );
        }),
      )
      .subscribe({
        error: error => {
          this.logger.error("Error occured in repo cleanup", { error });
        },
      });
  }

  private getNumberOfReposToRemove() {
    const count = Math.ceil(this.repoIndexService.size / 100);
    return Math.max(Math.min(count, 10), 1);
  }
}
