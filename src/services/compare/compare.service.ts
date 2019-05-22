import { Injectable, NotFoundException } from "@nestjs/common";
import { Commit, ConvenientPatch, Diff, Merge, Oid, Repository } from "nodegit";

import { GitFileDiff, PatchStatus } from "../../dtos";
import { GitDiff } from "../../dtos/git-diff";
import { CommitService, toGitCommit } from "../commit";
import { GitBaseOptions, RepoService } from "../repo";

@Injectable()
export class CompareService {
  constructor(private repoService: RepoService, private commitService: CommitService) {}

  public async compare(
    remote: string,
    baseSha: string,
    headSha: string,
    options: GitBaseOptions = {},
  ): Promise<GitDiff | NotFoundException> {
    const repo = await this.repoService.get(remote, options);
    const [baseCommit, headCommit] = await Promise.all([
      this.commitService.getCommit(repo, baseSha),
      this.commitService.getCommit(repo, headSha),
    ]);
    if (!baseCommit) {
      return new NotFoundException(`Base commit ${baseSha} was not found`);
    }
    if (!headCommit) {
      return new NotFoundException(`Head commit ${baseSha} was not found`);
    }

    return this.getComparison(repo, baseCommit, headCommit);
  }

  public async getMergeBase(repo: Repository, base: Oid, head: Oid): Promise<Commit | undefined> {
    const mergeBaseSha = await Merge.base(repo, base, head);
    return this.commitService.getCommit(repo, mergeBaseSha.toString());
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
    const files = await this.getFileDiffs(nativeBaseCommit, nativeHeadCommit);
    const commits = await this.listCommitIdsBetween(repo, mergeBase.id(), nativeHeadCommit.id());

    return new GitDiff({
      baseCommit,
      headCommit,
      mergeBaseCommit,
      totalCommits: commits.length,
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

    return patches.map(x => toFileDiff(x));
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
