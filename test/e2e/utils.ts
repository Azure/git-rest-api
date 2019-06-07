import path from "path";
import rimraf from "rimraf";
import { promisify } from "util";

const rm = promisify(rimraf);

const dataFolder = path.resolve(path.join(__dirname, "../../tmp"));

export async function deleteLocalRepo(name: string) {
  await rm(path.join(dataFolder, "repos", encodeURIComponent(name)));
}
