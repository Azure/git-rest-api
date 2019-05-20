import { NotFoundException } from "@nestjs/common";

import { RepoAuth } from "../../core";
import { CommitsController } from "./commits.controller";

const c1 = {
  sha: "sha1",
};

describe("CommitsController", () => {
  let controller: CommitsController;
  const commitServiceSpy = {
    get: jest.fn((_, sha) => (sha === "sha1" ? c1 : undefined)),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new CommitsController(commitServiceSpy as any);
  });

  it("get a commit", async () => {
    const auth = new RepoAuth();
    const commit = await controller.get("github.com/Azure/git-rest-api", "sha1", auth);
    expect(commitServiceSpy.get).toHaveBeenCalledTimes(1);
    expect(commitServiceSpy.get).toHaveBeenCalledWith("github.com/Azure/git-rest-api", "sha1", { auth });
    expect(commit).toEqual(c1);
  });

  it("throw a NotFoundException if commit doesn't exists", async () => {
    const auth = new RepoAuth();
    await expect(controller.get("github.com/Azure/git-rest-api", "sha-not-found", auth)).rejects.toThrow(
      NotFoundException,
    );
  });
});
