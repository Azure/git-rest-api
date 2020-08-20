import { BehaviorSubject, Subscription } from "rxjs";

import { DiskUsage } from "../disk-usage";
import { RepoCleanupService } from "./repo-cleanup.service";

const defaultDiskUsage: DiskUsage = {
  total: 10_000,
  available: 8_000,
  used: 2_000,
};

describe("RepoCleanupService", () => {
  let service: RepoCleanupService;

  const indexServiceSpy = {
    size: 20,
    getLeastUsedRepos: jest.fn(() => ["foo-1", "foo-2"]),
  };

  const repoServiceSpy = {
    deleteLocalRepo: jest.fn(),
  };

  const diskUsageService = {
    dataDiskUsage: new BehaviorSubject<DiskUsage>(defaultDiskUsage),
  };

  let sub: Subscription;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    diskUsageService.dataDiskUsage.next(defaultDiskUsage);
    service = new RepoCleanupService(indexServiceSpy as any, repoServiceSpy as any, diskUsageService as any);
    sub = service.start();
  });

  afterEach(() => {
    sub.unsubscribe();
    jest.useRealTimers();
  });

  it("Shouldn't do anything if there is enough disk available", () => {
    expect(indexServiceSpy.getLeastUsedRepos).not.toHaveBeenCalled();
    diskUsageService.dataDiskUsage.next({
      total: 10_000,
      available: 5_000,
      used: 5_000,
    });
    expect(indexServiceSpy.getLeastUsedRepos).not.toHaveBeenCalled();
    diskUsageService.dataDiskUsage.next({
      total: 10_000,
      available: 8_000,
      used: 2_000,
    });
    expect(indexServiceSpy.getLeastUsedRepos).not.toHaveBeenCalled();
  });

  it("Should try to delete repos if there is not enough space", () => {
    expect(indexServiceSpy.getLeastUsedRepos).not.toHaveBeenCalled();
    diskUsageService.dataDiskUsage.next({
      total: 10_000,
      available: 500,
      used: 9_500,
    });
    expect(indexServiceSpy.getLeastUsedRepos).toHaveBeenCalledTimes(1);
    expect(indexServiceSpy.getLeastUsedRepos).toHaveBeenCalledWith(1);

    jest.runAllTicks();
    expect(repoServiceSpy.deleteLocalRepo).toHaveBeenCalledTimes(2);
    expect(repoServiceSpy.deleteLocalRepo).toHaveBeenCalledWith("foo-1");
    expect(repoServiceSpy.deleteLocalRepo).toHaveBeenCalledWith("foo-2");
  });

  it("Should wait for the bathc of deletion to complete before checking the disk usage again", () => {
    expect(indexServiceSpy.getLeastUsedRepos).not.toHaveBeenCalled();
    diskUsageService.dataDiskUsage.next({
      total: 10_000,
      available: 500,
      used: 9_500,
    });
    expect(indexServiceSpy.getLeastUsedRepos).toHaveBeenCalledTimes(1);

    diskUsageService.dataDiskUsage.next({
      total: 10_000,
      available: 400,
      used: 9_600,
    });

    expect(indexServiceSpy.getLeastUsedRepos).toHaveBeenCalledTimes(1);
    diskUsageService.dataDiskUsage.next({
      total: 10_000,
      available: 300,
      used: 9_700,
    });

    expect(indexServiceSpy.getLeastUsedRepos).toHaveBeenCalledTimes(1);

    jest.runAllTicks();
    expect(repoServiceSpy.deleteLocalRepo).toHaveBeenCalledTimes(2);
    expect(repoServiceSpy.deleteLocalRepo).toHaveBeenCalledWith("foo-1");
    expect(repoServiceSpy.deleteLocalRepo).toHaveBeenCalledWith("foo-2");
  });
});
