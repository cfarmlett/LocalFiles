import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ExportResultPanel } from "./ExportResultPanel";

describe("ExportResultPanel", () => {
  it("renders single-output result actions and filename", () => {
    const markup = renderToStaticMarkup(
      <ExportResultPanel
        results={[
          {
            id: "merged",
            filename: "localfiles-merged.pdf",
            bytes: new Uint8Array(),
            mimeType: "application/pdf",
            url: "blob:localfiles-merged",
          },
        ]}
      />,
    );

    expect(markup).toContain("PDF Generated");
    expect(markup).toContain("localfiles-merged.pdf");
    expect(markup).toContain("Download PDF");
    expect(markup).toContain("Open PDF");
    expect(markup).not.toContain("<details");
    expect(markup).not.toContain("Generated File (1)");
  });

  it("renders multi-output result details", () => {
    const markup = renderToStaticMarkup(
      <ExportResultPanel
        primaryAction={{
          busyLabel: "Preparing archive...",
          description: "Download all generated split PDFs together.",
          isBusy: true,
          label: "Download ZIP",
          onClick: () => undefined,
        }}
        results={[
          {
            id: "page-1.pdf",
            filename: "page-1.pdf",
            bytes: new Uint8Array(),
            mimeType: "application/pdf",
            detail: "Pages 1",
            url: "blob:page-1",
          },
          {
            id: "page-2.pdf",
            filename: "page-2.pdf",
            bytes: new Uint8Array(),
            mimeType: "application/pdf",
            detail: "Pages 2",
            url: "blob:page-2",
          },
        ]}
      />,
    );

    expect(markup).toContain("PDFs Generated");
    expect(markup).toContain("2 files are ready to download.");
    expect(markup).toContain("Generated Files (2)");
    expect(markup).toContain("Preparing archive...");
    expect(markup).not.toContain("Preparing ZIP...");
    expect(markup).toContain("Download all generated split PDFs together.");
    expect(markup).toContain("page-1.pdf");
    expect(markup).toContain("Pages 2");
    expect(markup).toContain('aria-label="Download page-1.pdf"');
    expect(markup).toContain('aria-label="Open page-2.pdf"');
  });
});
