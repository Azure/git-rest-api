import { Injectable, NotFoundException } from "@nestjs/common";
import { TreeEntry, Repository } from "nodegit";

import { GitContents } from "../../dtos/git-contents";
import { GitDirObjectContent } from "../../dtos/git-dir-object-content";
import { GitFileObjectContent } from "../../dtos/git-file-object-content";
import { GitSubmoduleObjectContent } from "../../dtos/git-submodule-object-content";
import { CommitService } from "../commit";
import { GitBaseOptions, RepoService } from "../repo";

@Injectable()
export class ContentService {
  constructor(private repoService: RepoService, private commitService: CommitService) {}

  public async getContents(
    remote: string,
    path: string | undefined,
    ref: string | undefined = "master",
    options: GitBaseOptions = {},
  ): Promise<GitContents | NotFoundException> {
    return this.repoService.use(remote, options, async repo => {
      return this.getGitContents(repo, path, ref);
    });
  }

  public async getGitContents(repo: Repository, path: string | undefined, ref: string | undefined = "master") {
    const commit = await this.commitService.getCommit(repo, ref);
    if (!commit) {
      return new NotFoundException(`Ref '${ref}' not found.`);
    }

    let entries: TreeEntry[];

    if (path) {
      try {
        entries = [await commit.getEntry(path)];
      } catch (e) {
        return new NotFoundException(`${path} not found.`);
      }
    } else {
      const tree = await commit.getTree();
      entries = await tree.entries();
    }

    return this.getEntries(entries);
  }

  private async getFileEntryAsObject(entry: TreeEntry): Promise<GitFileObjectContent> {
    const blob = await entry.getBlob();

    return new GitFileObjectContent({
      type: "file",
      encoding: "base64",
      size: blob.rawsize(),
      name: entry.name(),
      path: entry.path(),
      content: blob.content().toString("base64"),
      sha: entry.sha(),
    });
  }

  private async getDirEntryAsObject(entry: TreeEntry): Promise<GitDirObjectContent> {
    return new GitDirObjectContent({
      type: "dir",
      size: 0,
      name: entry.name(),
      path: entry.path(),
      sha: entry.sha(),
    });
  }
  private async getSubmoduleEntryAsObject(entry: TreeEntry): Promise<GitSubmoduleObjectContent> {
    return new GitSubmoduleObjectContent({
      type: "submodule",
      size: 0,
      name: entry.name(),
      path: entry.path(),
      sha: entry.sha(),
    });
  }

  private async getEntries(entries: TreeEntry[]): Promise<GitContents> {
    const [files, dirs, submodules] = await Promise.all([
      Promise.all(entries.filter(entry => entry.isFile()).map(async entry => this.getFileEntryAsObject(entry))),
      Promise.all(entries.filter(entry => entry.isDirectory()).map(async entry => this.getDirEntryAsObject(entry))),
      Promise.all(
        entries.filter(entry => entry.isSubmodule()).map(async entry => this.getSubmoduleEntryAsObject(entry)),
      ),
    ]);

    return new GitContents({ files, dirs, submodules });
  }
}
