import { Injectable, NotFoundException } from "@nestjs/common";
import { Commit, Oid, Repository, Signature, Time } from "nodegit";

import { GitCommit, GitCommitRef } from "../../dtos";
import { GitSignature } from "../../dtos/git-signature";
import { GitBaseOptions, RepoService } from "../repo";

const LIST_COMMIT_PAGE_SIZE = 100;

export interface ListCommitsOptions {
  page?: number;
  ref?: string;
}

@Injectable()
export class CommitService {
  constructor(private repoService: RepoService) {}

  public async list(
    remote: string,
    options: ListCommitsOptions & GitBaseOptions = {},
  ): Promise<GitCommit[] | NotFoundException> {
    const repo = await this.repoService.get(remote, options);
    const commits = await this.listCommits(repo, options);
    if (commits instanceof NotFoundException) {
      return commits;
    }

    return Promise.all(commits.map(async x => toGitCommit(x)));
  }

  public async get(remote: string, commitSha: string, options: GitBaseOptions = {}): Promise<GitCommit | undefined> {
    const repo = await this.repoService.get(remote, options);
    const commit = await this.getCommit(repo, commitSha);
    if (!commit) {
      return undefined;
    }
    return toGitCommit(commit);
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

  public async listCommits(repo: Repository, options: ListCommitsOptions): Promise<Commit[] | NotFoundException> {
    const walk = repo.createRevWalk();
    if (options.ref) {
      const commit = await this.getCommit(repo, options.ref);
      if (!commit) {
        return new NotFoundException(`Couldn't find reference with name ${options.ref}`);
      }
      walk.push(commit.id());
    } else {
      walk.pushHead();
    }
    return walk.getCommits(LIST_COMMIT_PAGE_SIZE);
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
