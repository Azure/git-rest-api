import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { Tree, TreeEntry } from "nodegit";

import { GitDirObjectContent } from "../../dtos/git-dir-object-content";
import { GitFileObjectContent } from "../../dtos/git-file-object-content";
import { GitObjectContent } from "../../dtos/git-object-content";
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
  ): Promise<GitObjectContent | GitObjectContent[] | NotFoundException | InternalServerErrorException> {
    const repo = await this.repoService.get(remote, options);
    const commit = await this.commitService.getCommit(repo, ref);

    if (!commit) {
      return new NotFoundException(`Ref '${ref}' not found.`);
    }

    if (path) {
      try {
        const entry = await commit.getEntry(path);

        if (entry.isDirectory()) {
          const tree = await entry.getTree();
          return this.getDirectory(tree);
        }

        return this.getFileEntryAsObject(entry);
      } catch (e) {
        return new NotFoundException(`${path} not found.`);
      }
    } else {
      const tree = await commit.getTree();
      return this.getDirectory(tree);
    }
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

  private async getDirectory(dirTree: Tree): Promise<GitObjectContent[]> {
    const entries = await dirTree.entries();
    return Promise.all(
      entries.map(async entry => {
        if (entry.isDirectory()) {
          return this.getDirEntryAsObject(entry);
        } else if (entry.isFile()) {
          return this.getFileEntryAsObject(entry);
        } else if (entry.isSubmodule()) {
          return this.getSubmoduleEntryAsObject(entry);
        } else {
          throw new NotFoundException();
        }
      }),
    );
  }
}
