import { describe, expect, it } from "vitest";

import { appName } from "./index";

describe("web app scaffold", () => {
  it("keeps the app name available", () => {
    expect(appName).toBe("LocalDocs");
  });
});
