import { Injectable } from "@nestjs/common";
import fs from "fs";
import rimraf from "rimraf";
import { promisify } from "util";

const rm = promisify(rimraf);

@Injectable()
export class FSService {
  public async exists(path: string): Promise<boolean> {
    try {
      await fs.promises.access(path);
      return true;
    } catch {
      return false;
    }
  }

  public async mkdir(path: string): Promise<string> {
    await fs.promises.mkdir(path, { recursive: true });
    return path;
  }

  public async rm(path: string): Promise<void> {
    await rm(path);
  }
}
