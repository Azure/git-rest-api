import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";

import { Logger } from "../../core";
import { RepoReferenceRecord } from "../../models";

export interface RepoReference {
  readonly path: string;
  readonly lastUse: number;
  readonly lastFetch?: number;
}

const FETCH_CACHE_EXPIRY = 30_000; // 30s;

@Injectable()
export class RepoIndexService {
  private logger = new Logger(RepoIndexService);
  private readonly repos = new Map<string, RepoReference>();
  private repository: Repository<RepoReferenceRecord>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(RepoReferenceRecord);
    this.init().catch(e => {
      this.logger.error("Failed to load data from database", e);
    });
  }

  public async init() {
    const repos = await this.repository.find();
    for (const repo of repos) {
      this.repos.set(repo.path, { ...repo });
    }
  }

  public get size() {
    return this.repos.size;
  }

  private async update(ref: RepoReference) {
    this.repos.set(ref.path, ref);

    try {
      await this.repository.insert(ref);
    } catch (e) {
      await this.repository.update({ path: ref.path }, ref);
    }
  }

  public getLeastUsedRepos(count = 1): string[] {
    return [...this.repos.values()]
      .sort((a, b) => a.lastUse - b.lastUse)
      .slice(0, count)
      .map(x => x.path);
  }

  public needToFetch(repoId: string): boolean {
    const repo = this.repos.get(repoId);
    if (!repo || !repo.lastFetch) {
      return true;
    }
    const now = Date.now();
    return now - repo.lastFetch > FETCH_CACHE_EXPIRY;
  }

  public markRepoAsOpened(repoId: string) {
    const now = Date.now();
    const existing = this.repos.get(repoId);
    void this.update({ ...existing, path: repoId, lastUse: now });
  }

  public markRepoAsFetched(repoId: string) {
    const now = Date.now();
    const existing = this.repos.get(repoId);
    void this.update({ ...existing, path: repoId, lastFetch: now, lastUse: now });
  }
}
