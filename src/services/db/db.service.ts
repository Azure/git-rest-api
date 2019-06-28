import { createConnection } from "typeorm";

import { Configuration } from "../../config";
import { RepoReference } from "../../models";

export async function createDBConnection(configuration: Configuration) {
  return createConnection({
    type: "sqlite",
    database: `${configuration.dataDir}/data.sqlite`,
    entities: [RepoReference],
  });
}
