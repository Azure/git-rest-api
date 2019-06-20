import { Injectable } from "@nestjs/common";

export enum LocalRepoStatus {
  Initializing = "initializing",
  Updating = "updating",
  Deleting = "deleting",
  Ready = "ready",
}

export interface LocalRepo {
  readonly id: string;
  readonly status: LocalRepoStatus;
  readonly lastFetch: Date;
}

@Injectable()
export class RepoIndexService {}
