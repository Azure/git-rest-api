import { GitObjectContent } from "./git-object-content";

export class GitSubmoduleObjectContent extends GitObjectContent {
  constructor(gitObjectContent: GitSubmoduleObjectContent) {
    super(gitObjectContent);
  }
}
