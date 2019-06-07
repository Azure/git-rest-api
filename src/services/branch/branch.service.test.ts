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
    use: jest.fn((_, _1, action) => action(mockRepo)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BranchService(repoServiceSpy as any);
  });

  it("List the branches", async () => {
    const branches = await service.list("github.com/Azure/git-rest-api");

    expect(repoServiceSpy.use).toHaveBeenCalledTimes(1);
    expect(repoServiceSpy.use).toHaveBeenCalledWith("github.com/Azure/git-rest-api", {}, expect.any(Function));
    expect(mockRepo.getReferences).toHaveBeenCalledTimes(1);
    expect(branches).toEqual([b1, b2]);
  });
});
