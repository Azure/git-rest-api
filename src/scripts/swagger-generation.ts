import fs from "fs";
import { promisify } from "util";

import { createApp } from "../app";

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

const SWAGGER_FILE_PATH = "./swagger-spec.json";

export async function generateSwagger(): Promise<string> {
  const { document } = await createApp();
  reorderPaths(document.paths);

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

/**
 * Because of how the nestjs generate the path they might not be in order
 */
export function reorderPaths(paths: StringMap<StringMap<any>>) {
  for (const [path, methods] of Object.entries(paths)) {
    for (const def of Object.values(methods)) {
      if (def.parameters) {
        def.parameters = getOrderedPathParams(path, def.parameters);
      }
    }
  }
}

interface SwaggerParam {
  type: string;
  name: string;
  required: boolean;
  in: "path" | "header";
}

export function getOrderedPathParams(path: string, parameters: SwaggerParam[]) {
  const pathParams = parameters.filter(x => x.in === "path");
  const otherParams = parameters.filter(x => x.in !== "path");

  const sortedPathParams = pathParams.sort((a, b) => {
    return path.indexOf(`{${a.name}}`) - path.indexOf(`{${b.name}}`);
  });
  return [...sortedPathParams, ...otherParams];
}
