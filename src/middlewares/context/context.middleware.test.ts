import { getContext, setContext } from "../../core";
import { ContextMiddleware } from "./context.middleware";

describe("ContextMiddleware", () => {
  let middleware: ContextMiddleware;

  beforeEach(() => {
    middleware = new ContextMiddleware();
  });
  it("keeps the context with async await", done => {
    middleware.use({} as any, {} as any, async () => {
      setContext("requestId", "req-1");
      expect(getContext("requestId")).toEqual("req-1");

      await Promise.resolve();
      expect(getContext("requestId")).toEqual("req-1");
      done();
    });
  });

  it("keeps the context with callbacks", done => {
    middleware.use({} as any, {} as any, async () => {
      setContext("requestId", "req-1");
      expect(getContext("requestId")).toEqual("req-1");

      setTimeout(() => {
        expect(getContext("requestId")).toEqual("req-1");
        done();
      });
    });
  });

  it("doesn't mix up the contexts. Each request gets its own", done => {
    middleware.use({} as any, {} as any, async () => {
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

    middleware.use({} as any, {} as any, async () => {
      setContext("requestId", "req-2");
      expect(getContext("requestId")).toEqual("req-2");

      setTimeout(() => {
        expect(getContext("requestId")).toEqual("req-2");
        done();
      });
    });
  });
});
