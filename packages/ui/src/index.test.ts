import { describe, expect, it } from "vitest";

import { uiPackageReady } from "./index";

describe("ui package scaffold", () => {
  it("exports a placeholder marker", () => {
    expect(uiPackageReady).toBe(true);
  });
});
