import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SplitPdfPage } from "./SplitPdfPage";

describe("SplitPdfPage", () => {
  it("renders the default every-page workflow controls", () => {
    const markup = renderToStaticMarkup(<SplitPdfPage />);

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("No PDF selected yet.");
    expect(markup).toContain("Every Page");
    expect(markup).toContain("Every N Pages");
    expect(markup).toContain("Custom Ranges");
    expect(markup).toContain("Split PDF");
  });
});
