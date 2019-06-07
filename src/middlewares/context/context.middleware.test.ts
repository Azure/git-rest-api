import { getContext, setContext } from "../../core";
import { ContextMiddleware } from "./context.middleware";

describe("ContextMiddleware", () => {
  let middleware: ContextMiddleware;
  const response = {
    setHeader: jest.fn(),
  };
  let request: { requestId?: string };
  beforeEach(() => {
    jest.clearAllMocks();
    request = {};
    middleware = new ContextMiddleware();
  });

  describe("Setting some context", () => {
    it("should have set a request id", () => {
      middleware.use(request as any, response as any, async () => {
        expect(request.requestId).not.toBeUndefined();

        expect(response.setHeader).toHaveBeenCalledTimes(1);
        expect(response.setHeader).toHaveBeenCalledWith("x-request-id", request.requestId);
      });
    });
  });

  it("keeps the context with async await", done => {
    middleware.use(request as any, response as any, async () => {
      setContext("requestId", "req-1");
      expect(getContext("requestId")).toEqual("req-1");

      await Promise.resolve();
      expect(getContext("requestId")).toEqual("req-1");
      done();
    });
  });

  it("keeps the context with callbacks", done => {
    middleware.use(request as any, response as any, async () => {
      setContext("requestId", "req-1");
      expect(getContext("requestId")).toEqual("req-1");

      setTimeout(() => {
        expect(getContext("requestId")).toEqual("req-1");
        done();
      });
    });
  });

  it("doesn't mix up the contexts. Each request gets its own", done => {
    middleware.use(request as any, response as any, async () => {
      setContext("requestId", "req-1");
      expect(getContext("requestId")).toEqual("req-1");

      setTimeout(() => {
        expect(getContext("requestId")).toEqual("req-1");
        setTimeout(() => {
          expect(getContext("requestId")).toEqual("req-1");
          done();
        });
      });
    });

    middleware.use(request as any, response as any, async () => {
      setContext("requestId", "req-2");
      expect(getContext("requestId")).toEqual("req-2");

      setTimeout(() => {
        expect(getContext("requestId")).toEqual("req-2");
        done();
      });
    });
  });
});
