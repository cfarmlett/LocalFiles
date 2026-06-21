import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SplitPdfPage } from "./SplitPdfPage";

describe("SplitPdfPage", () => {
  it("renders the default interval workflow controls", () => {
    const markup = renderToStaticMarkup(<SplitPdfPage />);

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("No PDF selected yet.");
    expect(markup).toContain("Split every 1 page");
    expect(markup).toContain("Custom Ranges");
    expect(markup).toContain('aria-label="Pages per split PDF"');
    expect(markup).not.toContain("Pages per file");
    expect(markup.match(/type="number"/g)).toHaveLength(1);
    expect(markup.match(/type="radio"/g)).toHaveLength(2);
    expect(markup).toContain("Split PDF");
  });
});
