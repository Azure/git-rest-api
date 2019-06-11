import { Repository } from "nodegit";

import { RepositoryDestroyedError } from "./repo-destroyed-error";

export class GCRepo {
  public path: string;
  private references = 1;
  private destroyed = false;

  constructor(private repo: Repository) {
    this.path = this.repo.path();
  }

  /**
   * Get access to the repository
   */
  public get instance() {
    // Guard to make sure you are not using the repo after it was destroyed which would cause a segmentation fault and crash the server.
    // This will just throw an error which will result in a 500 which can be diagnoistied much better
    if (this.destroyed) {
      throw new RepositoryDestroyedError(this.path);
    }
    return this.repo;
  }

  public lock() {
    this.references++;
  }

  public unlock() {
    this.references--;
    if (this.references === 0) {
      this.destroyed = true;
      this.repo.cleanup();
    }
  }
}
