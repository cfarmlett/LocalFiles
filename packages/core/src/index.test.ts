import { describe, expect, it } from "vitest";

import { localProcessingPolicy } from "./index";

describe("local processing policy", () => {
  it("defaults to no uploads, analytics, or telemetry", () => {
    expect(localProcessingPolicy).toEqual({
      allowsUpload: false,
      analytics: false,
      telemetry: false,
    });
  });
});
