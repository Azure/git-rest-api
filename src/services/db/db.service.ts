import { createConnection } from "typeorm";

import { Configuration } from "../../config";
import { RepoReference } from "../../models";

export async function createDBConnection(configuration: Configuration) {
  const connection = await createConnection({
    type: "sqlite",
    database: `${configuration.dataDir}/data.sqlite`,
    entities: [RepoReference],
  });
  await connection.synchronize();
  return connection;
}
