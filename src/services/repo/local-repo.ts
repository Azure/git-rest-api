import { NotFoundException } from "@nestjs/common";
import { Cred, Fetch, FetchOptions, Remote, Repository } from "nodegit";
import { BehaviorSubject, Subject } from "rxjs";
import { filter, take, first, debounceTime, tap } from "rxjs/operators";

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
  readonly status: LocalRepoStatus.Initializing;
  readonly repo: undefined;
  readonly needToFetch: boolean;
  readonly reading: 0;
  readonly waitingRead: number;
}

interface UpdatingState {
  readonly status: LocalRepoStatus.Updating;
  readonly repo: Repository;
  readonly needToFetch: boolean;
  readonly reading: 0;
  readonly waitingRead: number;
}

interface ReadyToFetchState {
  readonly status: LocalRepoStatus.Ready;
  readonly repo: Repository;
  readonly needToFetch: true;
  readonly reading: 0;
  readonly waitingRead: number;
}

interface ReadyState {
  readonly status: LocalRepoStatus.Ready;
  readonly repo: Repository;
  readonly needToFetch: boolean;
  readonly reading: number;
  readonly waitingRead: number;
}

interface DeletingState {
  readonly status: LocalRepoStatus.Deleting;
  readonly repo: Repository;
  readonly needToFetch: boolean;
  readonly reading: 0;
  readonly waitingRead: number;
}

type LocalRepoState = InitializingState | UpdatingState | ReadyToFetchState | ReadyState | DeletingState;

export interface RemoteDef {
  name: string;
  remote: string;
}

const initialState: InitializingState = Object.freeze({
  status: LocalRepoStatus.Initializing,
  repo: undefined,
  needToFetch: false,
  reading: 0,
  waitingRead: 0,
});

export class LocalRepo {
  public onDestroy = new Subject();

  private logger = new Logger("LocalRepo");
  private state = new BehaviorSubject<LocalRepoState>(initialState);

  constructor(public readonly path: string, private fs: FSService, private repoIndex: RepoIndexService) {
    this.state
      .pipe(
        debounceTime(100), // Give a 100ms timeout before closing
        filter(x => {
          return (
            (x.status === LocalRepoStatus.Ready && x.reading === 0 && x.waitingRead === 0 && !x.needToFetch) ||
            x.status === LocalRepoStatus.Deleting
          );
        }),
      )
      .subscribe(x => {
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
    this.state.next(initialState);
    const repo = await this.loadRepo(remotes);
    this.state.next({ ...this.state.value, status: LocalRepoStatus.Ready, repo });
  }

  public async update(options: GitBaseOptions = {}) {
    const state = this.state.value;
    this.state.next({ ...state, needToFetch: true });
    const readyState = await this.waitForState<ReadyToFetchState>({
      status: LocalRepoStatus.Ready,
      reading: 0,
      needToFetch: true,
    });
    this.state.next({ ...readyState, status: LocalRepoStatus.Updating, needToFetch: false });

    await this.updateRepo(readyState.repo, options);
    if (this.state.value.status !== LocalRepoStatus.Updating) {
      this.logger.error(
        `Unexpected state changed occured for repo while updating ${this.path}. Status: ${this.state.value.status}`,
      );
      return;
    }
    this.state.next({ ...this.state.value, status: LocalRepoStatus.Ready });
  }

  public async use<T>(action: (repo: Repository) => Promise<T>): Promise<T> {
    this.state.next({ ...this.state.value, waitingRead: this.state.value.waitingRead + 1 });
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

  private async loadRepo(remotes: RemoteDef[]) {
    if (await this.fs.exists(this.path)) {
      return Repository.open(this.path);
    } else {
      const repo = await Repository.init(this.path, 1);
      for (const { name, remote: value } of remotes) {
        await Remote.create(repo, name, `https://${value}`);
      }
      return repo;
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
        first(),
      )
      .toPromise();
    return state as T;
  }
}
