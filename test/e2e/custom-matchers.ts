// tslint:disable: no-implicit-dependencies
import { MatcherState } from "expect";
import fs from "fs";
import SnapshotState from "jest-snapshot/build/State";
import path from "path";

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchSpecificSnapshot(snapshotFile: string): CustomMatcherResult;
      toMatchPayload(payloadName: string): CustomMatcherResult;
    }
  }
}

function getAbsolutePathToSnapshot(testPath: string, snapshotFile: string) {
  return path.isAbsolute(snapshotFile) ? snapshotFile : path.resolve(path.dirname(testPath), snapshotFile);
}

function serializeContent(content: object | object[]) {
  return JSON.stringify(content, null, 2);
}

type Context = jest.MatcherUtils &
  MatcherState & {
    snapshotState: SnapshotState;
  };

/**
 * Helper
 */
function toMatchPayload(this: Context, received: object | object[], payload: string): jest.CustomMatcherResult {
  return toMatchSpecificSnapshot.call(this, received, `__snapshots__/api/${payload}.json`);
}

function toMatchSpecificSnapshot(
  this: Context,
  received: object | object[],
  filename: string,
): jest.CustomMatcherResult {
  const filepath = getAbsolutePathToSnapshot(this.testPath!, filename);
  const content = serializeContent(received);
  const updateSnapshot: "none" | "all" | "new" = (this.snapshotState as any)._updateSnapshot;

  const coloredFilename = this.utils.DIM_COLOR(filename);
  const errorColor = this.utils.RECEIVED_COLOR;

  if (updateSnapshot === "none" && !fs.existsSync(filepath)) {
    // We're probably running in CI environment

    this.snapshotState.unmatched++;

    return {
      pass: this.isNot,
      message: () =>
        `New output file ${coloredFilename} was ${errorColor("not written")}.\n\n` +
        "The update flag must be explicitly passed to write a new snapshot.\n\n",
    };
  }

  if (fs.existsSync(filepath)) {
    const output = fs.readFileSync(filepath, "utf8");
    // The matcher is being used with `.not`
    if (this.isNot) {
      if (output !== content) {
        this.snapshotState.matched++;
        // The value of `pass` is reversed when used with `.not`
        return { pass: false, message: () => "" };
      } else {
        this.snapshotState.unmatched++;

        return {
          pass: true,
          message: () => `Expected received content ${errorColor("to not match")} the snapshot ${coloredFilename}.`,
        };
      }
    } else {
      if (output === content) {
        this.snapshotState.matched++;
        return { pass: true, message: () => "" };
      } else {
        if (updateSnapshot === "all") {
          fs.mkdirSync(path.dirname(filepath), { recursive: true });
          fs.writeFileSync(filepath, content);

          this.snapshotState.updated++;

          return { pass: true, message: () => "" };
        } else {
          this.snapshotState.unmatched++;

          return {
            pass: false,
            message: () =>
              `Received content ${errorColor("doesn't match")} the file ${coloredFilename}.\n\n${this.utils.diff(
                content,
                output,
              )}`,
          };
        }
      }
    }
  } else {
    if (!this.isNot && (updateSnapshot === "new" || updateSnapshot === "all")) {
      fs.mkdirSync(path.dirname(filepath), { recursive: true });
      fs.writeFileSync(filepath, content);

      this.snapshotState.added++;

      return { pass: true, message: () => "" };
    } else {
      this.snapshotState.unmatched++;

      return {
        pass: true,
        message: () => `The output file ${coloredFilename} ${errorColor("doesn't exist")}.`,
      };
    }
  }
}

expect.extend({ toMatchSpecificSnapshot, toMatchPayload } as any);
