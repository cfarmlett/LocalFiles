import { describe, expect, it } from "vitest";

import { pdfAdapterStatus } from "./index";

describe("pdf package scaffold", () => {
  it("does not include a PDF implementation yet", () => {
    expect(pdfAdapterStatus).toBe("not-implemented");
  });
});
