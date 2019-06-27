import { NotFoundException } from "@nestjs/common";
import { Cred, Fetch, FetchOptions, Remote, Repository } from "nodegit";
import { BehaviorSubject, Subject } from "rxjs";
import { debounceTime, filter } from "rxjs/operators";

import { Logger } from "../../core";
import { FSService } from "../fs";
import { RepoIndexService } from "../repo-index";
import { StateMutex } from "./mutex";
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
  Idle = "idle",
  Reading = "reading",
}

export interface RemoteDef {
  name: string;
  remote: string;
}

export class LocalRepo {
  public onDestroy = new Subject();

  private repo?: Repository;
  private currentUpdate?: Promise<void>;

  private mutex = new StateMutex<LocalRepoStatus, LocalRepoStatus.Reading>(
    LocalRepoStatus.Idle,
    LocalRepoStatus.Initializing,
  );

  private logger = new Logger("LocalRepo");
  private refs = new BehaviorSubject(1); // Automatically start with a reference

  constructor(public readonly path: string, private fs: FSService, private repoIndex: RepoIndexService) {
    this.refs
      .pipe(
        debounceTime(100), // Give a 100ms timeout before closing
        filter(x => x === 0),
      )
      .subscribe(() => {
        this.dispose();
      });
  }

  public ref() {
    const refs = this.refs.value;
    this.refs.next(refs + 1);
  }

  public unref() {
    this.refs.next(this.refs.value - 1);
  }

  public dispose() {
    if (this.repo) {
      this.repo.cleanup();
    }
    this.refs.complete();
    this.onDestroy.next();
    this.onDestroy.complete();
  }

  public async init(remotes: RemoteDef[]): Promise<void> {
    const lock = await this.mutex.lock(LocalRepoStatus.Initializing, { exclusive: true });
    this.repo = await this.loadRepo(remotes);
    lock.release();
  }

  public async update(options: GitBaseOptions = {}) {
    if (!this.currentUpdate) {
      this.currentUpdate = this.lockAndUpdate(options);
    }
    return this.currentUpdate;
  }

  public async use<T>(action: (repo: Repository) => Promise<T>): Promise<T> {
    const lock = await this.mutex.lock(LocalRepoStatus.Reading);

    if (!this.repo) {
      throw new Error("Repo should have been loaded. Was init called");
    }

    try {
      return await action(this.repo);
    } finally {
      lock.release();
    }
  }

  private async loadRepo(remotes: RemoteDef[]) {
    if (await this.fs.exists(this.path)) {
      console.log(`Exists? ${this.path}`);
      try {
        return await Repository.open(this.path);
      } catch (error) {
        this.logger.error("Failed to open repository. Deleting it");
        await this.fs.rm(this.path);
      }
    } else {
      console.log(`Not Exists? ${this.path}`);
    }

    const repo = await Repository.init(this.path, 1);
    for (const { name, remote: value } of remotes) {
      await Remote.create(repo, name, `https://${value}`);
    }
    return repo;
  }

  private async lockAndUpdate(options: GitBaseOptions = {}) {
    const lock = await this.mutex.lock(LocalRepoStatus.Updating, { exclusive: true });
    if (!this.repo) {
      throw new Error("Repo should have been loaded. Was init called");
    }
    try {
      await this.updateRepo(this.repo, options);
    } finally {
      lock.release();
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
}
