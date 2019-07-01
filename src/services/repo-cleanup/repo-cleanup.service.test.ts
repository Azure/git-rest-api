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
    delete: jest.fn(),
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

});
