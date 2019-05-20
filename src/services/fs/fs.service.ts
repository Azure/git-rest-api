import { Injectable } from "@nestjs/common";
import fs from "fs";

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
}
