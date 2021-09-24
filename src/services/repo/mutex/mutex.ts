import uuid from "uuid/v4";

export interface Lock {
  readonly id: string;
  readonly release: () => void;
}

export interface LockOptions {
  exclusive: boolean;
}

/**
 * Mutex supporting shared and exclusive locks.
 * Exclusive locks have priority: If one is requested, following shared lock request will have to wait for the exclusive lock to be acquited and released
 */
export class Mutex {
  public get pending() {
    return !(
      this.sharedLocks.size === 0 &&
      this.exclusiveLocks.size === 0 &&
      this.sharedQueue.length === 0 &&
      this.exclusiveQueue.length === 0
    );
  }

  private readonly sharedLocks = new Set<string>();
  private readonly exclusiveLocks = new Set<string>();
  private readonly exclusiveQueue: ((lock: Lock) => void)[] = [];
  private readonly sharedQueue: ((lock: Lock) => void)[] = [];

  public lock({ exclusive }: LockOptions = { exclusive: false }): Promise<Lock> {
    const promise = new Promise<Lock>(resolve =>
      exclusive ? this.exclusiveQueue.push(resolve) : this.sharedQueue.push(resolve),
    );
    this._dispatchNext();

    return promise;
  }

  private _dispatchNext() {
    if (this.exclusiveQueue.length > 0) {
      if (this.sharedLocks.size === 0 && this.exclusiveLocks.size === 0) {
        const resolve = this.exclusiveQueue.shift();
        if (resolve) {
          const lock = this.createLock(this.exclusiveLocks);
          resolve(lock);
        }
      }
    } else if (this.sharedQueue.length > 0) {
      if (this.exclusiveLocks.size === 0) {
        const resolve = this.sharedQueue.shift();
        if (resolve) {
          const lock = this.createLock(this.sharedLocks);
          resolve(lock);
        }
      }
    }
  }

  private createLock(set: Set<string>) {
    const id = uuid();
    set.add(id);

    return {
      id,
      release: () => {
        set.delete(id);
        this._dispatchNext();
      },
    };
  }
}
