import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App, appSections } from "./App";

describe("App shell", () => {
  it("defines the expected sections", () => {
    expect(appSections.map((section) => section.label)).toEqual([
      "Home",
      "Split PDF",
      "Merge PDF",
      "Reorder Pages",
      "Rotate Pages",
      "Delete Pages",
      "Remove Metadata",
      "Redact PDF",
      "Privacy",
    ]);
  });

  it("renders local-first privacy copy", () => {
    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("LocalDocs.org");
    expect(markup).toContain("Files stay local in the browser.");
    expect(markup).toContain("No backend, no accounts, no analytics");
    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("Reorder Pages");
    expect(markup).toContain("Rotate Pages");
    expect(markup).toContain("Delete Pages");
    expect(markup).toContain("Remove Metadata");
    expect(markup).toContain("Redaction is high risk");
  });
});
