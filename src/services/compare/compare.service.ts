import { Injectable } from "@nestjs/common";
import { Commit, ConvenientPatch, Diff } from "nodegit";

import { IGitFileDiff, PatchStatus } from "../../dtos";
import { GitDiff } from "../../dtos/git-diff";
import { CommitService, getCommit } from "../commit";
import { GitBaseOptions, RepoService } from "../repo";

@Injectable()
export class CompareService {
  constructor(private repoService: RepoService, private commitService: CommitService) {}

  public async compare(
    remote: string,
    baseSha: string,
    headSha: string,
    options: GitBaseOptions = {},
  ): Promise<any | undefined> {
    const repo = await this.repoService.get(remote, options);
    const [baseCommit, headCommit] = await Promise.all([
      this.commitService.getCommit(repo, baseSha),
      this.commitService.getCommit(repo, headSha),
    ]);
    if (!baseCommit || !headCommit) {
      return undefined;
    }

    return this.getComparison(baseCommit, headCommit);
  }

  public async getComparison(nativeBaseCommit: Commit, nativeHeadCommit: Commit) {
    const [baseCommit, headCommit] = await Promise.all([getCommit(nativeBaseCommit), getCommit(nativeHeadCommit)]);

    const baseTree = await nativeBaseCommit.getTree();
    const headTree = await nativeHeadCommit.getTree();
    const diff = ((await headTree.diff(baseTree)) as unknown) as Diff;
    await diff.findSimilar({
      flags: Diff.FIND.RENAMES,
    });
    const patches = await diff.patches();

    const files: IGitFileDiff[] = [];
    for (const patch of patches) {
      const filename = patch.newFile().path();
      const previousFilename = patch.oldFile().path();
      const stats = patch.lineStats();
      files.push({
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
    return new GitDiff({
      baseCommit,
      headCommit,
      files,
    });
  }
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