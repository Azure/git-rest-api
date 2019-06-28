import nodegit from "nodegit";

import { delay } from "../../../utils";
import { LocalRepo } from "./local-repo";

const origin = {
  name: "origin",
  remote: "example.com/git-rest-api.git",
};

describe("LocalRepo", () => {
  let repo: LocalRepo;

  const fsSpy = {
    exists: jest.fn(),
    rm: jest.fn(),
  };
  const repoIndexSpy = {
    markRepoAsOpened: jest.fn(),
    markRepoAsFetched: jest.fn(),
  };

  const onDestroy = jest.fn();

  const repoSpy = {
    cleanup: jest.fn(),
  };
  const MockRepository = {
    open: jest.fn(() => Promise.resolve(repoSpy)),
    init: jest.fn(() => Promise.resolve(repoSpy)),
  };

  const MockRemote = {
    create: jest.fn(),
  };

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();

    nodegit.Repository = MockRepository as any;
    nodegit.Remote = MockRemote as any;

    repo = new LocalRepo("foo", fsSpy as any, repoIndexSpy as any);
    repo.onDestroy.subscribe(onDestroy);
  });

  describe("init the repo", () => {
    it("opens the existing one if the path exists", async () => {
      fsSpy.exists.mockResolvedValue(true);
      await repo.init([origin]);
      expect(MockRepository.open).toHaveBeenCalledTimes(1);
      expect(MockRepository.open).toHaveBeenCalledWith("foo");
      expect(MockRepository.init).not.toHaveBeenCalled();

      expect(fsSpy.rm).not.toHaveBeenCalled();
    });

    it("init the repo if the path doesn't exists", async () => {
      fsSpy.exists.mockResolvedValue(false);
      await repo.init([origin]);
      expect(MockRepository.init).toHaveBeenCalledTimes(1);
      expect(MockRepository.init).toHaveBeenCalledWith("foo", 1);
      expect(MockRepository.open).not.toHaveBeenCalled();

      expect(MockRemote.create).toHaveBeenCalledTimes(1);
      expect(MockRemote.create).toHaveBeenCalledWith(repoSpy, "origin", "https://example.com/git-rest-api.git");
    });

    it("delete then reinit the repo if it fails to open when the path exists", async () => {
      fsSpy.exists.mockResolvedValue(true);
      MockRepository.open.mockRejectedValue(new Error("Failed to open repo"));
      await repo.init([origin]);
      expect(MockRepository.open).toHaveBeenCalledTimes(1);
      expect(MockRepository.open).toHaveBeenCalledWith("foo");

      expect(fsSpy.rm).toHaveBeenCalledTimes(1);
      expect(fsSpy.rm).toHaveBeenCalledWith("foo");

      expect(MockRepository.init).toHaveBeenCalledTimes(1);
      expect(MockRepository.init).toHaveBeenCalledWith("foo", 1);

      expect(MockRemote.create).toHaveBeenCalledTimes(1);
      expect(MockRemote.create).toHaveBeenCalledWith(repoSpy, "origin", "https://example.com/git-rest-api.git");
    });

    it("calling init again doesn't do anything", async () => {
      fsSpy.exists.mockResolvedValue(true);
      const init1 = repo.init([origin]);
      await delay();
      const init2 = repo.init([origin]);
      await init1;
      await init2;
      expect(MockRepository.open).toHaveBeenCalledTimes(1);
      expect(MockRepository.init).not.toHaveBeenCalled();

      await repo.init([origin]);
      expect(MockRepository.open).toHaveBeenCalledTimes(1);
      expect(MockRepository.init).not.toHaveBeenCalled();
      expect(fsSpy.rm).not.toHaveBeenCalled();
    });
  });

  describe("dispose of the repo when nothing is using it", () => {
    it("does nothing if the repo wasn't opened", () => {
      expect(onDestroy).not.toHaveBeenCalled();
      repo.unref();
      expect(onDestroy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(200);
      expect(repoSpy.cleanup).not.toHaveBeenCalled();
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });

    it("destroy the repo if it was opened", async () => {
      fsSpy.exists.mockResolvedValue(true);
      expect(onDestroy).not.toHaveBeenCalled();
      await repo.init([origin]);
      repo.unref();
      expect(onDestroy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(200);
      expect(repoSpy.cleanup).toHaveBeenCalledTimes(1);
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });

    it("counts the refs", async () => {
      fsSpy.exists.mockResolvedValue(true);
      expect(onDestroy).not.toHaveBeenCalled();
      repo.ref();
      repo.ref();
      await repo.init([origin]);

      // Remove ref 1/3
      repo.unref();
      jest.advanceTimersByTime(200);
      expect(onDestroy).not.toHaveBeenCalled();

      // Remove ref 2/3
      repo.unref();
      jest.advanceTimersByTime(200);
      expect(onDestroy).not.toHaveBeenCalled();

      // Remove ref 3/3
      repo.unref();
      jest.advanceTimersByTime(200);
      expect(repoSpy.cleanup).toHaveBeenCalledTimes(1);
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });

    it("shouldn't delete if repo is reused within the timeout period", async () => {
      fsSpy.exists.mockResolvedValue(true);
      expect(onDestroy).not.toHaveBeenCalled();
      await repo.init([origin]);

      // Remove ref
      repo.unref();
      jest.advanceTimersByTime(50);
      expect(onDestroy).not.toHaveBeenCalled();

      // Other ref coming in
      repo.ref();
      jest.advanceTimersByTime(200);
      expect(onDestroy).not.toHaveBeenCalled();

      // Remove other ref
      repo.unref();
      jest.advanceTimersByTime(200);
      expect(repoSpy.cleanup).toHaveBeenCalledTimes(1);
      expect(onDestroy).toHaveBeenCalledTimes(1);
    });
  });
});
