import { Lock, LockOptions, Mutex } from "./mutex";

/**
 * Mutex that also keeps a state depending on the lock
 */
export class StateMutex<State, SharedState extends State> {
  public state: State;

  private mutex = new Mutex();

  constructor(private readonly idleState: State, initialState: State) {
    this.state = initialState;
  }

  public lock(state: SharedState, options?: { exclusive: false }): Promise<Lock>;
  public lock<T extends State>(state: T, options: { exclusive: true }): Promise<Lock>;
  public async lock(state: State, options?: LockOptions): Promise<Lock> {
    const lock = await this.mutex.lock(options);
    this.state = state;
    return {
      id: lock.id,
      release: () => {
        lock.release();
        if (!this.mutex.pending) {
          this.state = this.idleState;
        }
      },
    };
  }
}
