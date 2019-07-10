import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository, Tree, TreeEntry } from "nodegit";

import {
  GitContents,
  GitDirObjectContent,
  GitFileObjectWithContent,
  GitFileObjectWithoutContent,
  GitSubmoduleObjectContent,
  GitTree,
} from "../../dtos";
import { CommitService } from "../commit";
import { GitBaseOptions, RepoService } from "../repo";

@Injectable()
export class ContentService {
  constructor(private repoService: RepoService, private commitService: CommitService) {}

  public async getContents(
    remote: string,
    path: string | undefined,
    ref: string | undefined = "master",
    recursive: boolean = false,
    includeContents: boolean = true,
    options: GitBaseOptions = {},
  ): Promise<GitContents | GitTree | NotFoundException> {
    return this.repoService.use(remote, options, async repo => {
      return this.getGitContents(repo, path, recursive, includeContents, ref);
    });
  }

  public async getGitContents(
    repo: Repository,
    path: string | undefined,
    recursive: boolean,
    includeContents: boolean,
    ref: string | undefined = "master",
  ) {
    const commit = await this.commitService.getCommit(repo, ref);
    if (!commit) {
      return new NotFoundException(`Ref '${ref}' not found.`);
    }

    let entries: TreeEntry[];

    if (path) {
      try {
        const pathEntry = await commit.getEntry(path);

        const [rootEntry, childEntries] = await Promise.all([
          commit.getEntry(path),
          recursive && pathEntry.isTree() ? this.getAllChildEntries(await pathEntry.getTree()) : [],
        ]);

        entries = [rootEntry, ...childEntries];
      } catch (e) {
        return new NotFoundException(`${path} not found.`);
      }
    } else {
      const tree = await commit.getTree();
      entries = recursive ? await this.getAllChildEntries(tree) : await tree.entries();
    }

    return this.getEntries(entries, includeContents);
  }

  private async getFileEntryAsObject(
    entry: TreeEntry,
    includeContents: boolean,
  ): Promise<GitFileObjectWithContent | GitFileObjectWithoutContent> {
    const blob = await entry.getBlob();
    const file = {
      type: "file",
      encoding: "base64",
      size: blob.rawsize(),
      name: entry.name(),
      path: entry.path(),
      sha: entry.sha(),
    };

    if (includeContents) {
      return new GitFileObjectWithContent({
        ...file,
        content: blob.content().toString("base64"),
      });
    }

    return new GitFileObjectWithoutContent(file);
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

  private async getEntries(entries: TreeEntry[], includeContents: boolean): Promise<GitContents | GitTree> {
    const [files, dirs, submodules] = await Promise.all([
      Promise.all(
        entries.filter(entry => entry.isFile()).map(async entry => this.getFileEntryAsObject(entry, includeContents)),
      ),
      Promise.all(entries.filter(entry => entry.isDirectory()).map(async entry => this.getDirEntryAsObject(entry))),
      Promise.all(
        entries.filter(entry => entry.isSubmodule()).map(async entry => this.getSubmoduleEntryAsObject(entry)),
      ),
    ]);

    if (includeContents) {
      return new GitContents({ files, dirs, submodules });
    }

    return new GitTree({ files: files as GitFileObjectWithContent[], dirs, submodules });
  }

  private async getAllChildEntries(tree: Tree): Promise<TreeEntry[]> {
    return new Promise((resolve, reject) => {
      const eventEmitter = tree.walk(false);

      eventEmitter.on("end", (trees: TreeEntry[]) => {
        resolve(trees);
      });

      eventEmitter.on("error", error => {
        reject(error);
      });

      eventEmitter.start();
    });
  }
}
