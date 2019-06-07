import { Injectable, NotFoundException } from "@nestjs/common";
import { Commit, Oid, Repository, Revwalk, Signature, Time } from "nodegit";

import { PaginatedList, Pagination, getPage, getPaginationSkip } from "../../core";
import { GitCommit, GitCommitRef } from "../../dtos";
import { GitSignature } from "../../dtos/git-signature";
import { GitBaseOptions, RepoService } from "../repo";

const LIST_COMMIT_PAGE_SIZE = 100;

export interface ListCommitsOptions {
  pagination?: Pagination;
  ref?: string;
}

@Injectable()
export class CommitService {
  constructor(private repoService: RepoService) {}

  public async list(
    remote: string,
    options: ListCommitsOptions & GitBaseOptions = {},
  ): Promise<PaginatedList<GitCommit> | NotFoundException> {
    return this.repoService.use(remote, options, async repo => {
      const commits = await this.listCommits(repo, options);
      if (commits instanceof NotFoundException) {
        return commits;
      }

      const items = await Promise.all(commits.items.map(async x => toGitCommit(x)));
      return {
        ...commits,
        items,
      };
    });
  }

  public async get(remote: string, commitSha: string, options: GitBaseOptions = {}): Promise<GitCommit | undefined> {
    return this.repoService.use(remote, options, async repo => {
      const commit = await this.getCommit(repo, commitSha);
      if (!commit) {
        return undefined;
      }
      return toGitCommit(commit);
    });
  }

  /**
   * @param repo Repository instance
   * @param ref Commit SHA, Branch name
   */
  public async getCommit(repo: Repository, ref: string | Oid): Promise<Commit | undefined> {
    try {
      return await repo.getCommit(ref);
    } catch {
      if (typeof ref !== "string") {
        return undefined;
      }
      try {
        return await repo.getReferenceCommit(ref);
      } catch (e) {
        try {
          return await repo.getReferenceCommit(`origin/${ref}`);
        } catch {
          return undefined;
        }
      }
    }
  }

  public async getCommitOrDefault(repo: Repository, ref: string | undefined) {
    if (ref) {
      return this.getCommit(repo, ref);
    } else {
      const branch = await repo.getCurrentBranch();
      const name = branch.shorthand();
      return repo.getReferenceCommit(`origin/${name}`);
    }
  }

  public async listCommits(
    repo: Repository,
    options: ListCommitsOptions,
  ): Promise<PaginatedList<Commit> | NotFoundException> {
    const walk = repo.createRevWalk();

    const page = getPage(options.pagination);
    const commit = await this.getCommitOrDefault(repo, options.ref);
    if (!commit) {
      return new NotFoundException(`Couldn't find reference with name ${options.ref}`);
    }
    walk.push(commit.id());

    const skip = getPaginationSkip(options.pagination, LIST_COMMIT_PAGE_SIZE);
    await walkSkip(walk, skip);
    const commits = await walk.getCommits(LIST_COMMIT_PAGE_SIZE);

    let total = skip + LIST_COMMIT_PAGE_SIZE;

    while (true) {
      try {
        await walk.next();
        total++;
      } catch (e) {
        break;
      }
    }
    return {
      items: commits,
      page,
      total,
      perPage: LIST_COMMIT_PAGE_SIZE,
    };
  }
}

export async function toGitCommit(commit: Commit): Promise<GitCommit> {
  const [author, committer, parents] = await Promise.all([getAuthor(commit), getCommitter(commit), getParents(commit)]);
  return new GitCommit({
    sha: commit.sha(),
    message: commit.message(),
    author,
    committer,
    parents,
  });
}

/**
 * Get the list of the parents of the commit
 */
export async function getParents(commit: Commit): Promise<GitCommitRef[]> {
  const parents = await commit.getParents(10);
  return parents.map(parent => {
    return new GitCommitRef({ sha: parent.sha() });
  });
}

export async function getAuthor(commit: Commit): Promise<GitSignature> {
  const author = await commit.author();
  return getSignature(author);
}

export async function getCommitter(commit: Commit): Promise<GitSignature> {
  const committer = await commit.committer();
  return getSignature(committer);
}

export function getSignature(sig: Signature): GitSignature {
  return new GitSignature({ email: sig.email(), name: sig.name(), date: getDateFromTime(sig.when()) });
}

export function getDateFromTime(time: Time): Date {
  return new Date(time.time() * 1000);
}

/**
 * Try to skip the given number of item in the walk.
 * If there is less than ask remaining it will just stop gracfully
 */
async function walkSkip(revwalk: Revwalk, skip: number) {
  for (let i = 0; i < skip; i++) {
    try {
      await revwalk.next();
    } catch {
      return;
    }
  }
}
