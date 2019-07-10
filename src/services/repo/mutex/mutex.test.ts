import { delay } from "../../../utils";
import { Mutex } from "./mutex";

describe("Mutex", () => {
  let mutex: Mutex;

  beforeEach(() => {
    mutex = new Mutex();
  });

  it("acquire multiple read locks", async () => {
    const lock1 = await mutex.lock();
    const lock2 = await mutex.lock();
    expect(lock1.id).not.toEqual(lock2.id);
    lock1.release();
    lock2.release();
  });

  it("acquire exclusive locks sequentially", async () => {
    const lock1Spy = jest.fn();
    const lock2Spy = jest.fn();
    const lock1Promise = mutex.lock({ exclusive: true }).then(x => {
      lock1Spy();
      return x;
    });
    const lock2Promise = mutex.lock({ exclusive: true }).then(x => {
      lock2Spy();
      return x;
    });

    await delay();

    expect(lock1Spy).toHaveBeenCalledTimes(1);
    expect(lock2Spy).not.toHaveBeenCalled();

    const lock1 = await lock1Promise;
    lock1.release();
    await delay();

    expect(lock2Spy).toHaveBeenCalledTimes(1);

    const lock2 = await lock2Promise;
    lock2.release();
  });

  it("acquire exclusive wait on shared lock", async () => {
    const lock1Spy = jest.fn();
    const lock2Spy = jest.fn();
    const lock1Promise = mutex.lock().then(x => {
      lock1Spy();
      return x;
    });
    const lock2Promise = mutex.lock({ exclusive: true }).then(x => {
      lock2Spy();
      return x;
    });

    await delay();

    expect(lock1Spy).toHaveBeenCalledTimes(1);
    expect(lock2Spy).not.toHaveBeenCalled();

    const lock1 = await lock1Promise;
    lock1.release();
    await delay();

    expect(lock2Spy).toHaveBeenCalledTimes(1);

    const lock2 = await lock2Promise;
    lock2.release();
  });
});
