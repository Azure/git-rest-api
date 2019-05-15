import { Injectable } from "@nestjs/common";
import fs from "fs";
import makeDir from "make-dir";
import util from "util";

const fsPromises = {
  exists: util.promisify(fs.exists),
};

@Injectable()
export class FSService {
  public async exists(path: string): Promise<boolean> {
    return fsPromises.exists(path);
  }

  public async makeDir(path: string): Promise<string> {
    return makeDir(path);
  }
}
