export const notUndefined = <T>(x: T | undefined): x is T => x !== undefined;
export const delay = (timeout?: number) => new Promise(r => setTimeout(r, timeout));

export class Deferred<T = void> {
  public promise: Promise<T>;
  public hasCompleted = false;
  public resolve!: T extends void ? () => void : (v: T) => void;
  public reject!: (e: unknown) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.reject = x => {
        this.hasCompleted = true;
        reject(x);
      };
      this.resolve = ((x: T) => {
        this.hasCompleted = true;
        resolve(x);
      }) as any;
    });
  }
}
