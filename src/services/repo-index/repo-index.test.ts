import { RepoIndexService } from "./repo-index.service";

describe("RepoIndexService", () => {
  let service: RepoIndexService;
  let now: number;
  const nowSpy = jest.fn(() => now);
  let originalNow: typeof Date.now;

  beforeEach(() => {
    originalNow = Date.now;
    now = Date.now();
    Date.now = nowSpy;
    service = new RepoIndexService();
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  it("get the least recently used repos", () => {
    service.markRepoAsOpened("foo-1");
    now += 100;
    service.markRepoAsFetched("foo-2");
    now += 100;
    service.markRepoAsFetched("foo-3");
    now += 100;
    service.markRepoAsOpened("foo-4");
    now -= 10000;
    service.markRepoAsOpened("foo-0");

    expect(service.getLeastUsedRepos(3)).toEqual(["foo-0", "foo-1", "foo-2"]);
  });

  it("needs to fetch if the repo was never opened", () => {
    expect(service.needToFetch("foo-1")).toBe(true);
  });

  it("needs to fetch if the repo was never fetched", () => {
    service.markRepoAsOpened("foo-1");

    expect(service.needToFetch("foo-1")).toBe(true);
  });

  it("needs to fetch only after the cache timeout expire", () => {
    service.markRepoAsFetched("foo-1");
    expect(service.needToFetch("foo-1")).toBe(false);

    now += 29_999;
    expect(service.needToFetch("foo-1")).toBe(false);
    now += 2;
    expect(service.needToFetch("foo-1")).toBe(true);
    now += 10_000;
    expect(service.needToFetch("foo-1")).toBe(true);
  });
});
