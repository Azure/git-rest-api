import { createConnection } from "typeorm";

import { Configuration } from "../../config";
import { RepoReferenceRecord } from "../../models";

export async function createDBConnection(configuration: Configuration) {
  const connection = await createConnection({
    type: "sqlite",
    database: `${configuration.dataDir}/data.sqlite`,
    entities: [RepoReferenceRecord],
  });
  await connection.synchronize();
  return connection;
}
