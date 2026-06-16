import { describe, expect, it } from "vitest";

import {
  PdfProcessingError,
  StubLocalPdfAdapter,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "./index";

const samplePdfBytes = new Uint8Array([37, 80, 68, 70]);

describe("StubLocalPdfAdapter", () => {
  it("can be used through the PdfAdapter interface", () => {
    const adapter: PdfAdapter = new StubLocalPdfAdapter();

    expect(adapter.name).toBe("stub-local-pdf-adapter");
    expect(typeof adapter.readMetadata).toBe("function");
    expect(typeof adapter.split).toBe("function");
    expect(typeof adapter.merge).toBe("function");
  });

  it("exposes a metadata shape for future adapters", () => {
    const metadata: PdfDocumentMetadata = {
      pageCount: 3,
      title: "Local sample",
    };

    expect(metadata).toEqual({
      pageCount: 3,
      title: "Local sample",
    });
  });

  it("rejects empty documents before attempting metadata processing", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(adapter.readMetadata(new Uint8Array())).rejects.toMatchObject({
      name: "PdfProcessingError",
      code: "invalid-document",
      message: "PDF document bytes must be a non-empty Uint8Array.",
    });
  });

  it("reports metadata as an unsupported operation for valid bytes", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(adapter.readMetadata(samplePdfBytes)).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Reading PDF metadata is not implemented yet.",
    });
  });

  it("validates split ranges before reporting unsupported processing", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(
      adapter.split(null as unknown as Parameters<PdfAdapter["split"]>[0]),
    ).rejects.toMatchObject({
      code: "invalid-document",
      message: "PDF split request must be an object.",
    });

    await expect(
      adapter.split({
        document: samplePdfBytes,
        ranges: [{ start: 2, end: 1 }],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message: "Page ranges must use positive one-based start and end values.",
    });

    await expect(
      adapter.split({
        document: samplePdfBytes,
        ranges: [{ start: 1, end: 2 }],
      }),
    ).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Splitting PDFs is not implemented yet.",
    });
  });

  it("validates merge inputs before reporting unsupported processing", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(
      adapter.merge(null as unknown as Parameters<PdfAdapter["merge"]>[0]),
    ).rejects.toMatchObject({
      code: "invalid-document",
      message: "PDF merge request must be an object.",
    });

    await expect(adapter.merge({ documents: [] })).rejects.toMatchObject({
      code: "invalid-document",
      message: "At least one PDF document is required.",
    });

    await expect(
      adapter.merge({ documents: [samplePdfBytes, samplePdfBytes] }),
    ).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Merging PDFs is not implemented yet.",
    });
  });
});

describe("PdfProcessingError", () => {
  it("carries a stable processing error code", () => {
    const error = new PdfProcessingError(
      "processing-failed",
      "Processing failed.",
    );

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("PdfProcessingError");
    expect(error.code).toBe("processing-failed");
    expect(error.message).toBe("Processing failed.");
  });
});
