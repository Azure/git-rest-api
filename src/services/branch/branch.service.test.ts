import { GitBranch } from "../../dtos";
import { BranchService } from "./branch.service";

const b1 = new GitBranch({
  name: "master",
  commit: {
    sha: "sha1",
  },
});

const b2 = new GitBranch({
  name: "stable",
  commit: {
    sha: "sha2",
  },
});

const refs = [
  { isRemote: () => true, name: () => "refs/remotes/origin/master", target: () => "sha1" },
  { isRemote: () => false, name: () => "refs/head/feat1", target: () => "sha3" },
  { isRemote: () => true, name: () => "refs/remotes/origin/stable", target: () => "sha2" },
];

describe("BranchService", () => {
  let service: BranchService;

  const mockRepo = {
    getReferences: jest.fn(() => {
      return refs;
    }),
  };

  const repoServiceSpy = {
    get: jest.fn(() => mockRepo),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BranchService(repoServiceSpy as any);
  });

  it("List the branches", async () => {
    const branches = await service.list("github.com/Azure/git-rest-api");

    expect(repoServiceSpy.get).toHaveBeenCalledTimes(1);
    expect(repoServiceSpy.get).toHaveBeenCalledWith("github.com/Azure/git-rest-api", {});
    expect(mockRepo.getReferences).toHaveBeenCalledTimes(1);
    expect(branches).toEqual([b1, b2]);
  });
});
