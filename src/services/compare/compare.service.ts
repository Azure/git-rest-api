import { Injectable, NotFoundException } from "@nestjs/common";
import { Commit, ConvenientPatch, Diff, Merge, Oid, Repository } from "nodegit";

import { Logger } from "../../core";
import { GitDiff, GitFileDiff, PatchStatus } from "../../dtos";
import { GitUtils, notUndefined } from "../../utils";
import { CommitService, toGitCommit } from "../commit";
import { GitBaseOptions, RepoService } from "../repo";

const MAX_COMMIT_PER_DIFF = 250;
const MAX_FILES_PER_DIFF = 300;

@Injectable()
export class CompareService {
  private logger = new Logger(CompareService);

  constructor(private repoService: RepoService, private commitService: CommitService) {}

  public async compare(
    remote: string,
    base: string,
    head: string,
    options: GitBaseOptions = {},
  ): Promise<GitDiff | NotFoundException> {
    return this.useCompareRepo(remote, base, head, options, async compareRepo => {
      const repo = compareRepo.repo;
      const [baseCommit, headCommit] = await Promise.all([
        this.commitService.getCommit(repo, compareRepo.baseRef),
        this.commitService.getCommit(repo, compareRepo.headRef),
      ]);
      if (!baseCommit) {
        return new NotFoundException(`Base ${base} was not found`);
      }
      if (!headCommit) {
        return new NotFoundException(`Head ${base} was not found`);
      }

      return this.getComparison(repo, baseCommit, headCommit);
    });
  }

  public async getMergeBase(repo: Repository, base: Oid, head: Oid): Promise<Commit | undefined> {
    try {
      const mergeBaseSha = await Merge.base(repo, base, head);
      return this.commitService.getCommit(repo, mergeBaseSha.toString());
    } catch (error) {
      this.logger.info("Merge base was not found", { error });
      return undefined;
    }
  }

  public async getComparison(
    repo: Repository,
    nativeBaseCommit: Commit,
    nativeHeadCommit: Commit,
  ): Promise<GitDiff | NotFoundException> {
    const [baseCommit, headCommit] = await Promise.all([toGitCommit(nativeBaseCommit), toGitCommit(nativeHeadCommit)]);

    const mergeBase = await this.getMergeBase(repo, nativeBaseCommit.id(), nativeHeadCommit.id());
    if (!mergeBase) {
      return new NotFoundException(`Couldn't find a common ancestor for commits`);
    }

    const mergeBaseCommit = await toGitCommit(mergeBase);
    const files = await this.getFileDiffs(mergeBase, nativeHeadCommit);
    const commitIds = await this.listCommitIdsBetween(repo, mergeBase.id(), nativeHeadCommit.id());

    const commits = await Promise.all(
      commitIds.slice(0, MAX_COMMIT_PER_DIFF).map(async x => {
        const commit = await this.commitService.getCommit(repo, x);
        return commit ? toGitCommit(commit) : undefined;
      }),
    );
    return new GitDiff({
      baseCommit,
      headCommit,
      mergeBaseCommit,
      totalCommits: commitIds.length,
      commits: commits.filter(notUndefined),
      files,
    });
  }

  public async listCommitIdsBetween(repo: Repository, from: Oid, to: Oid): Promise<Oid[]> {
    const walk = repo.createRevWalk();
    walk.push(to);
    let current: Oid = to;
    const commits = [];
    while (true) {
      current = await walk.next();
      if (current.equal(from)) {
        break;
      }
      commits.push(current);
    }
    return commits;
  }

  public async getFileDiffs(nativeBaseCommit: Commit, nativeHeadCommit: Commit): Promise<GitFileDiff[]> {
    const [baseTree, headTree] = await Promise.all([nativeBaseCommit.getTree(), nativeHeadCommit.getTree()]);
    const diff = ((await headTree.diff(baseTree)) as unknown) as Diff;
    await diff.findSimilar({
      flags: Diff.FIND.RENAMES,
    });
    const patches = await diff.patches();

    return patches.map(x => toFileDiff(x)).slice(0, MAX_FILES_PER_DIFF);
  }

  private async useCompareRepo<T>(
    remote: string,
    base: string,
    head: string,
    options: GitBaseOptions,
    action: (p: any) => Promise<T>,
  ): Promise<T> {
    const baseRef = GitUtils.parseRemoteReference(base, remote);
    const headRef = GitUtils.parseRemoteReference(head, remote);

    const baseRemote = baseRef.remote;
    const headRemote = headRef.remote;

    if (baseRemote !== headRemote) {
      return this.repoService.useForCompare(
        {
          name: "baser",
          remote: baseRemote,
        },
        {
          name: "headr",
          remote: headRemote,
        },
        options,
        repo =>
          action({ repo, baseRef: `refs/remotes/baser/${baseRef.ref}`, headRef: `refs/remotes/headr/${headRef.ref}` }),
      );
    } else {
      return this.repoService.use(headRemote, options, repo =>
        action({ repo, baseRef: baseRef.ref, headRef: headRef.ref }),
      );
    }
  }
}

export function toFileDiff(patch: ConvenientPatch): GitFileDiff {
  const filename = patch.newFile().path();
  const previousFilename = patch.oldFile().path();
  const stats = patch.lineStats();
  return new GitFileDiff({
    filename,
    sha: patch
      .newFile()
      .id()
      .toString(),
    status: getPatchStatus(patch),
    additions: stats.total_additions,
    deletions: stats.total_deletions,
    changes: stats.total_additions + stats.total_deletions,
    previousFilename: previousFilename !== filename ? previousFilename : undefined,
  });
}

export function getPatchStatus(patch: ConvenientPatch): PatchStatus {
  if (patch.isRenamed()) {
    return PatchStatus.Renamed;
  } else if (patch.isModified()) {
    return PatchStatus.Modified;
  } else if (patch.isDeleted()) {
    return PatchStatus.Deleted;
  } else if (patch.isAdded()) {
    return PatchStatus.Added;
  } else {
    return PatchStatus.Unmodified;
  }
}
