import { Injectable } from "@nestjs/common";

export interface LocalRepoReference {
  readonly path: string;
  readonly lastFetch: number;
}

const FETCH_CACHE_EXPIRY = 30_000; // 30s;

@Injectable()
export class RepoIndexService {
  private readonly repos = new Map<string, LocalRepoReference>();

  public needToFetch(repoId: string): boolean {
    const repo = this.repos.get(repoId);
    if (!repo) {
      return true;
    }
    const now = new Date().getTime();
    return now - repo.lastFetch > FETCH_CACHE_EXPIRY;
  }

  public markRepoAsFetched(repoId: string) {
    const now = Date.now();
    const existing = this.repos.get(repoId);
    this.repos.set(repoId, { ...existing, path: repoId, lastFetch: now });
  }
}
