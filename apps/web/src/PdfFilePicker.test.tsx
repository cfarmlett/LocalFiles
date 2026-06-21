import { createRef } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PdfFilePicker } from "./PdfFilePicker";

describe("PdfFilePicker", () => {
  it("renders an accessible single-PDF picker and selection summary", () => {
    const markup = renderToStaticMarkup(
      <PdfFilePicker
        errors={[]}
        inputId="single-file-input"
        inputRef={createRef<HTMLInputElement>()}
        onFilesSelected={vi.fn()}
        selectionSummary="No PDF selected yet."
      />,
    );

    expect(markup).toContain("Choose one PDF or drop it here");
    expect(markup).toContain("Only one PDF is accepted.");
    expect(markup).toContain("Choose PDF");
    expect(markup).toContain('accept="application/pdf,.pdf"');
    expect(markup).toContain('aria-labelledby="single-file-input-label"');
    expect(markup).toContain(
      'aria-describedby="single-file-input-instructions"',
    );
    expect(markup).toContain('class="visually-hidden"');
    expect(markup).not.toContain("multiple");
    expect(markup).toContain("No PDF selected yet.");
  });

  it("renders multi-PDF copy, custom instructions, and errors", () => {
    const markup = renderToStaticMarkup(
      <PdfFilePicker
        errors={["notes.txt is not a PDF file."]}
        inputId="merge-file-input"
        inputRef={createRef<HTMLInputElement>()}
        instructions="Add PDFs in the order you want."
        multiple
        onFilesSelected={vi.fn()}
        selectionSummary="2 PDFs selected, 4 total pages."
      />,
    );

    expect(markup).toContain("Choose PDFs or drop them here");
    expect(markup).toContain("Add PDFs in the order you want.");
    expect(markup).toContain("Choose PDFs");
    expect(markup).toContain('multiple=""');
    expect(markup).toContain('role="alert"');
    expect(markup).toContain("notes.txt is not a PDF file.");
    expect(markup).toContain("2 PDFs selected, 4 total pages.");
  });
});
