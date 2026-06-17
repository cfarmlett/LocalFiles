import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ReorderPagesPage } from "./ReorderPagesPage";

describe("ReorderPagesPage", () => {
  it("renders the default reorder workflow controls", () => {
    const markup = renderToStaticMarkup(<ReorderPagesPage />);

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("No PDF selected yet.");
    expect(markup).toContain("Reorder Pages");
    expect(markup).not.toContain("Rotate");
    expect(markup).not.toContain("Delete");
  });
});
