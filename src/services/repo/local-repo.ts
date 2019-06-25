import { NotFoundException } from "@nestjs/common";
import { Cred, Fetch, FetchOptions, Remote, Repository } from "nodegit";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, take } from "rxjs/operators";

import { Logger } from "../../core";
import { FSService } from "../fs";
import { RepoIndexService } from "../repo-index";
import { GitBaseOptions } from "./repo.service";

export function credentialsCallback(options: GitBaseOptions): () => Cred {
  return () => {
    if (options.auth) {
      return options.auth.toCreds();
    }
    return Cred.defaultNew();
  };
}

export const defaultFetchOptions: FetchOptions = {
  downloadTags: 0,
  prune: Fetch.PRUNE.GIT_FETCH_PRUNE,
};

export enum LocalRepoStatus {
  Initializing = "initializing",
  Updating = "updating",
  Deleting = "deleting",
  Ready = "ready",
}

interface InitializingState {
  status: LocalRepoStatus.Initializing;
  repo: undefined;
  needToFetch: boolean;
  reading: 0;
}

interface UpdatingState {
  status: LocalRepoStatus.Updating;
  repo: Repository;
  needToFetch: boolean;
  reading: 0;
}

interface ReadyToFetchState {
  status: LocalRepoStatus.Ready;
  repo: Repository;
  needToFetch: true;
  reading: 0;
}

interface ReadyState {
  status: LocalRepoStatus.Ready;
  repo: Repository;
  needToFetch: boolean;
  reading: number;
}

interface DeletingState {
  status: LocalRepoStatus.Deleting;
  repo: Repository;
  needToFetch: boolean;
  reading: 0;
}

type LocalRepoState = InitializingState | UpdatingState | ReadyToFetchState | ReadyState | DeletingState;

export interface RemoteDef {
  name: string;
  remote: string;
}

export class LocalRepo {
  public onDestroy = new Subject();

  private logger = new Logger("LocalRepo");
  private state = new BehaviorSubject<LocalRepoState>({
    status: LocalRepoStatus.Initializing,
    needToFetch: false,
    repo: undefined,
    reading: 0,
  });

  constructor(public readonly path: string, private fs: FSService, private repoIndex: RepoIndexService) {
    this.state
      .pipe(
        filter(
          x =>
            (x.status === LocalRepoStatus.Ready && x.reading === 0! && x.needToFetch) ||
            x.status === LocalRepoStatus.Deleting,
        ),
      )
      .subscribe(() => {
        this.dispose();
      });
  }

  public dispose() {
    const state = this.state.value;
    if (state.repo) {
      state.repo.cleanup();
    }
    this.state.complete();
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  public async init(remotes: RemoteDef[]): Promise<void> {
    this.state.next({ status: LocalRepoStatus.Initializing, repo: undefined, needToFetch: false, reading: 0 });
    const repo = await this.loadRepo();
    for (const { name, remote: value } of remotes) {
      await Remote.create(repo, name, `https://${value}`);
    }
    this.state.next({ ...this.state.value, status: LocalRepoStatus.Ready, repo });
  }

  public async update(options: GitBaseOptions = {}) {
    const state = this.state.value;
    if (state.status !== LocalRepoStatus.Ready || state.reading !== 0) {
      this.state.next({ ...state, needToFetch: true });
      return;
    }
    const readyState = await this.waitForState<ReadyToFetchState>({
      status: LocalRepoStatus.Ready,
      reading: 0,
      needToFetch: true,
    });
    this.state.next({ ...readyState, status: LocalRepoStatus.Updating, needToFetch: false });

    await this.updateRepo(state.repo, options);
    if (this.state.value.status !== LocalRepoStatus.Updating) {
      this.logger.error(
        `Unexpected state changed occured for repo while updating ${this.path}. Status: ${this.state.value.status}`,
      );
      return;
    }
    this.state.next({ ...this.state.value, status: LocalRepoStatus.Ready });
  }

  public async use<T>(action: (repo: Repository) => Promise<T>): Promise<T> {
    const state = await this.waitForState<ReadyState>({
      status: LocalRepoStatus.Ready,
      needToFetch: false,
    });
    this.state.next({ ...state, reading: state.reading + 1 });
    try {
      return await action(state.repo);
    } finally {
      if (this.state.value.status !== LocalRepoStatus.Ready) {
        this.logger.error(
          `Unexpected state changed occured for repo while reading ${this.path}. Status: ${this.state.value.status}`,
        );
      } else {
        this.state.next({ ...this.state.value, reading: state.reading - 1 });
      }
    }
  }

  private async loadRepo() {
    if (await this.fs.exists(this.path)) {
      return Repository.open(this.path);
    } else {
      return Repository.init(this.path, 1);
    }
  }

  private async updateRepo(repo: Repository, options: GitBaseOptions) {
    try {
      await repo.fetchAll({
        ...defaultFetchOptions,
        callbacks: {
          credentials: credentialsCallback(options),
        },
      });
      this.repoIndex.markRepoAsFetched(this.path);
    } catch {
      throw new NotFoundException();
    }
  }

  private async waitForState<T extends LocalRepoState>(condition: Partial<T>): Promise<T> {
    const keys: Array<keyof LocalRepoState> = Object.keys(condition) as any;
    const state = await this.state
      .pipe(
        filter(x => {
          for (const key of keys) {
            if (x[key] !== condition[key]) {
              return false;
            }
          }
          return true;
        }),
        take(1),
      )
      .toPromise();
    return state as T;
  }
}
