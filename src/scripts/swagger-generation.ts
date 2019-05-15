import fs from "fs";
import { promisify } from "util";

import { createApp } from "../app";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const SWAGGER_FILE_PATH = "./swagger-spec.json";

export async function generateSwagger(): Promise<string> {
  const { document } = await createApp();
  return JSON.stringify(document, null, 2);
}

export async function saveSwagger() {
  const specs = await generateSwagger();
  await writeFile(SWAGGER_FILE_PATH, specs);
}

export async function getSavedSwagger(): Promise<string> {
  const response = await readFile(SWAGGER_FILE_PATH);
  return response.toString();
}
