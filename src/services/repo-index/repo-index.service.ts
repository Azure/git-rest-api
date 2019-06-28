import { Injectable } from "@nestjs/common";
import { Connection, Repository } from "typeorm";

import { RepoReference } from "../../models";

export interface IRepoReference {
  readonly path: string;
  readonly lastUse: number;
  readonly lastFetch?: number;
}

const FETCH_CACHE_EXPIRY = 30_000; // 30s;

@Injectable()
export class RepoIndexService {
  private readonly repos = new Map<string, IRepoReference>();
  private repository: Repository<RepoReference>;

  constructor(connection: Connection) {
    this.repository = connection.getRepository(RepoReference);
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
    this.repos.set(repoId, { ...existing, path: repoId, lastUse: now });
  }

  public markRepoAsFetched(repoId: string) {
    const now = Date.now();
    const existing = this.repos.get(repoId);
    this.repos.set(repoId, { ...existing, path: repoId, lastFetch: now, lastUse: now });
  }
}
