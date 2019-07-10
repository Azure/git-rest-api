import { createConnection } from "typeorm";

import { Configuration } from "../../config";
import { RepoReferenceRecord } from "../../models";

/**
 * Create a DB Connection to sqlite and sync the schema.
 * Can be used as NestJS async factory and then have the Connection as a injectable for other service.
 */
export async function createDBConnection(configuration: Configuration) {
  const connection = await createConnection({
    type: "sqlite",
    database: `${configuration.dataDir}/data.sqlite`,
    entities: [RepoReferenceRecord],
  });
  await connection.synchronize();
  return connection;
}
