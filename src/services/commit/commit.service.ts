import { Injectable } from "@nestjs/common";
import { Commit, Repository, Signature, Time } from "nodegit";

import { GitCommit, GitCommitRef } from "../../dtos";
import { GitSignature } from "../../dtos/git-signature";
import { GitBaseOptions, RepoService } from "../repo";

@Injectable()
export class CommitService {
  constructor(private repoService: RepoService) {}

  public async get(remote: string, commitSha: string, options: GitBaseOptions = {}): Promise<GitCommit | undefined> {
    const repo = await this.repoService.get(remote, options);
    const commit = await this.getCommit(repo, commitSha);
    if (!commit) {
      return undefined;
    }
    const [author, committer, parents] = await Promise.all([
      getAuthor(commit),
      getCommitter(commit),
      getParents(commit),
    ]);
    return new GitCommit({
      sha: commit.sha(),
      message: commit.message(),
      author,
      committer,
      parents,
    });
  }

  public async getCommit(repo: Repository, commitSha: string): Promise<Commit | undefined> {
    try {
      return await repo.getCommit(commitSha);
    } catch {
      return undefined;
    }
  }
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
