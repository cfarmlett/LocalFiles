import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { App, appSections, toolSections } from "./App";

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

    expect(toolSections.map((section) => section.label)).toEqual([
      "Split PDF",
      "Merge PDF",
      "Reorder Pages",
      "Rotate Pages",
      "Delete Pages",
      "Remove Metadata",
    ]);
  });

  it("renders verifiable local-processing claims and honest limitations", () => {
    const markup = renderToStaticMarkup(<App />);

    expect(markup).toContain("LocalFiles.org");
    expect(markup).toContain('aria-label="PDF tools"');
    expect(markup).toContain("Files are processed locally in your browser.");
    expect(markup).toContain(
      "Your PDFs are not uploaded to a LocalFiles server.",
    );
    expect(markup).toContain("No account is required.");
    expect(markup).toContain('class="current-section visually-hidden"');
    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("Reorder Pages");
    expect(markup).toContain("Rotate Pages");
    expect(markup).toContain("Delete Pages");
    expect(markup).toContain("Remove Metadata");
    expect(markup).toContain("Redaction is not available.");
    expect(markup).toContain('status-label">Unavailable');
    expect(markup).toContain('aria-label="Trust and project resources"');
    expect(markup).toContain('href="https://github.com/cfarmlett/LocalFiles"');
    expect(markup).toContain(
      'href="https://github.com/cfarmlett/LocalFiles/blob/main/LICENSE"',
    );
    expect(markup).toContain(
      'href="https://github.com/cfarmlett/LocalFiles/blob/main/PRIVACY.md"',
    );
    expect(markup).toContain(
      'href="https://github.com/cfarmlett/LocalFiles/blob/main/SECURITY.md"',
    );
  });
});
