import { GitObjectContent } from "./git-object-content";

export class GitDirObjectContent extends GitObjectContent {
  constructor(gitObjectContent: GitDirObjectContent) {
    super(gitObjectContent);
  }
}
