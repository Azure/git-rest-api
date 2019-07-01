import nodegit from "nodegit";

import { RepoAuth } from "../../../core";
import { Deferred, delay } from "../../../utils";
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
    fetchAll: jest.fn(() => Promise.resolve()),
  };
  const MockRepository = {
    open: jest.fn(() => Promise.resolve(repoSpy)),
    init: jest.fn(() => Promise.resolve(repoSpy)),
  };

  const MockRemote = {
    create: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    nodegit.Repository = MockRepository as any;
    nodegit.Remote = MockRemote as any;

    repo = new LocalRepo("foo", fsSpy as any, repoIndexSpy as any);
    repo.onDestroy.subscribe(onDestroy);
  });

  afterEach(() => {
    if (repo) {
      repo.dispose();
    }
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
      MockRepository.open.mockRejectedValueOnce(new Error("Failed to open repo"));
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
      const init1 = await repo.init([origin]);
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

  describe("Update and use", () => {
    beforeEach(async () => {
      fsSpy.exists.mockResolvedValue(true);
      await repo.init([origin]);
    });

    it("use the repo", async () => {
      const response = await repo.use(async r => {
        expect(r).toBe(repoSpy);
        return "My-result";
      });

      expect(response).toEqual("My-result");
    });

    it("update the repo", async () => {
      const options = {
        auth: new RepoAuth(),
      };
      await repo.update(options);
      expect(repoSpy.fetchAll).toHaveBeenCalledTimes(1);
    });

    it("doesn't trigger multiple updates if one is already in progress", async () => {
      let resolve: () => void;
      const fetchPromise = new Promise<void>(r => (resolve = r));
      repoSpy.fetchAll.mockImplementation(() => fetchPromise);
      const update1 = repo.update();
      const update2 = repo.update();
      await delay();
      const update3 = repo.update();
      resolve!();
      await Promise.all([update1, update2, update3]);
      expect(repoSpy.fetchAll).toHaveBeenCalledTimes(1);
    });

    it("should wait for uses to complete before updating", async () => {
      const use1Deferer = new Deferred();
      const use2Deferer = new Deferred();
      const use3Deferer = new Deferred();

      const use1 = repo.use(() => use1Deferer.promise);
      const use2 = repo.use(() => use2Deferer.promise);

      const update = repo.update();

      const use3 = repo.use(() => use3Deferer.promise);

      expect(repoSpy.fetchAll).not.toHaveBeenCalled();

      use1Deferer.resolve();
      use2Deferer.resolve();
      await use1;
      await use2;
      await update;
      expect(repoSpy.fetchAll).toHaveBeenCalledTimes(1);
      use3Deferer.resolve();
      await use3;
    });
  });

  describe("dispose of the repo when nothing is using it", () => {
    beforeEach(() => {
      repo.dispose();
      jest.useFakeTimers();
      jest.clearAllMocks();

      repo = new LocalRepo("foo", fsSpy as any, repoIndexSpy as any);
      repo.onDestroy.subscribe(onDestroy);
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

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
