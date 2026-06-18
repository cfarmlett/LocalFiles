import { describe, expect, it } from "vitest";

import { createAsyncOperationTracker } from "./asyncOperationToken";

describe("createAsyncOperationTracker", () => {
  it("invalidates earlier async completions after clear", () => {
    const tracker = createAsyncOperationTracker();
    const staleToken = tracker.begin();

    tracker.invalidate();

    expect(tracker.isCurrent(staleToken)).toBe(false);
  });

  it("treats a newer operation as current", () => {
    const tracker = createAsyncOperationTracker();
    const staleToken = tracker.begin();
    const currentToken = tracker.begin();

    expect(tracker.isCurrent(staleToken)).toBe(false);
    expect(tracker.isCurrent(currentToken)).toBe(true);
  });

  it("prevents a stale file-read completion from applying state after clear", async () => {
    const tracker = createAsyncOperationTracker();
    const state: { filename?: string } = {};
    const delayedFile = createDeferred<string>();
    const operationToken = tracker.begin();

    const readFile = async () => {
      const filename = await delayedFile.promise;

      if (tracker.isCurrent(operationToken)) {
        state.filename = filename;
      }
    };

    const readPromise = readFile();
    tracker.invalidate();
    delayedFile.resolve("stale.pdf");
    await readPromise;

    expect(state.filename).toBeUndefined();
  });

  it("prevents a stale processing completion from applying output after clear", async () => {
    const tracker = createAsyncOperationTracker();
    const state: { outputFilename?: string } = {};
    const delayedExport = createDeferred<string>();
    const operationToken = tracker.begin();

    const generateOutput = async () => {
      const outputFilename = await delayedExport.promise;

      if (tracker.isCurrent(operationToken)) {
        state.outputFilename = outputFilename;
      }
    };

    const exportPromise = generateOutput();
    tracker.invalidate();
    delayedExport.resolve("stale-output.pdf");
    await exportPromise;

    expect(state.outputFilename).toBeUndefined();
  });
});

function createDeferred<T>(): Readonly<{
  promise: Promise<T>;
  resolve: (value: T) => void;
}> {
  let resolve: (value: T) => void = () => {
    throw new Error("Deferred promise was resolved before initialization.");
  };

  const promise = new Promise<T>((nextResolve) => {
    resolve = nextResolve;
  });

  return { promise, resolve };
}
