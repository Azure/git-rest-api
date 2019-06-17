import { Injectable } from "@nestjs/common";
import diskusage from "diskusage";
import { Observable, Subscription, from, interval } from "rxjs";
import { map, publishReplay, refCount, switchMap } from "rxjs/operators";

import { Configuration } from "../../config";
import { Telemetry } from "../../core";

const DISK_USAGE_COLLECTION_INTERVAL = 10_000;

export interface DiskUsage {
  available: number;
  total: number;
  used: number;
}

@Injectable()
export class DiskUsageService {
  public dataDiskUsage: Observable<DiskUsage>;

  constructor(private config: Configuration, private telemetry: Telemetry) {
    this.dataDiskUsage = interval(DISK_USAGE_COLLECTION_INTERVAL).pipe(
      switchMap(() => from(this.checkDataDiskUsage())),
      map(({ available, total }) => {
        return { available, total, used: total - available };
      }),
      publishReplay(1),
      refCount(),
    );
  }

  public startCollection(): Subscription {
    return this.dataDiskUsage.subscribe(usage => {
      this.emitDiskUsage(usage);
    });
  }

  private emitDiskUsage(usage: DiskUsage) {
    this.telemetry.emitMetric({
      name: "DATA_DISK_USAGE_AVAILABLE",
      value: usage.available,
    });
  }

  private checkDataDiskUsage(): Promise<diskusage.DiskUsage> {
    return diskusage.check(this.config.dataDir);
  }
}
