import { Repository } from "nodegit";

import { GitRemotePermission } from "../services";

export interface LocalRepo {
  repo: Repository;
  permission: GitRemotePermission;
}
