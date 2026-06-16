import { describe, expect, it } from "vitest";

import { PlaceholderPanel, PrivacyNote, Section } from "./index";

describe("ui components", () => {
  it("exports shared app shell primitives", () => {
    expect(Section).toBeTypeOf("function");
    expect(PlaceholderPanel).toBeTypeOf("function");
    expect(PrivacyNote).toBeTypeOf("function");
  });
});
