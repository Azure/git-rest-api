import { RepoAuth } from "../../core";
import { BranchesController } from "./branches.controller";

const b1 = {
  name: "master",
  commit: {
    sha: "sha1",
  },
};

const b2 = {
  name: "master",
  commit: {
    sha: "sha2",
  },
};

describe("BranchesController", () => {
  let controller: BranchesController;
  const branchServiceSpy = {
    list: jest.fn(() => [b1, b2]),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new BranchesController(branchServiceSpy as any);
  });

  it("list the branches", async () => {
    const auth = new RepoAuth();
    const branches = await controller.list("github.com/Azure/git-rest-api", auth);

    expect(branches).toEqual([b1, b2]);
  });
});
