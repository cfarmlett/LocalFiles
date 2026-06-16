import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";

import {
  LocalPdfAdapter,
  PdfProcessingError,
  StubLocalPdfAdapter,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "./index";

async function createPdf(pageCount: number): Promise<Uint8Array> {
  const document = await PDFDocument.create();

  for (let index = 0; index < pageCount; index += 1) {
    document.addPage();
  }

  return document.save();
}

const invalidPdfBytes = new Uint8Array([37, 80, 68, 70, 45]);

describe("LocalPdfAdapter", () => {
  it("reads page count metadata locally", async () => {
    const adapter = new LocalPdfAdapter();
    const metadata = await adapter.readMetadata(await createPdf(2));

    expect(metadata.pageCount).toBe(2);
  });

  it("merges PDFs in request order", async () => {
    const adapter = new LocalPdfAdapter();
    const first = await createPdf(1);
    const second = await createPdf(2);
    const merged = await adapter.merge({ documents: [second, first] });
    const metadata = await adapter.readMetadata(merged);

    expect(metadata.pageCount).toBe(3);
  });

  it("splits PDFs into one output per requested range", async () => {
    const adapter = new LocalPdfAdapter();
    const outputs = await adapter.split({
      document: await createPdf(4),
      ranges: [
        { start: 1, end: 1 },
        { start: 2, end: 4 },
      ],
    });

    await expect(adapter.readMetadata(outputs[0])).resolves.toMatchObject({
      pageCount: 1,
    });
    await expect(adapter.readMetadata(outputs[1])).resolves.toMatchObject({
      pageCount: 3,
    });
  });

  it("rejects split ranges outside the document bounds", async () => {
    const adapter = new LocalPdfAdapter();

    await expect(
      adapter.split({
        document: await createPdf(2),
        ranges: [{ start: 1, end: 3 }],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message: "Page range end must be less than or equal to page count (2).",
    });
  });

  it("rejects non-PDF bytes before parsing", async () => {
    const adapter = new LocalPdfAdapter();

    await expect(
      adapter.readMetadata(new Uint8Array([1, 2, 3])),
    ).rejects.toMatchObject({
      code: "invalid-document",
      message: "Only PDF files can be processed.",
    });
  });

  it("maps corrupted PDFs to a stable processing error", async () => {
    const adapter = new LocalPdfAdapter();

    await expect(adapter.readMetadata(invalidPdfBytes)).rejects.toMatchObject({
      code: "invalid-document",
      message: "The PDF could not be read. It may be corrupted or unsupported.",
    });
  });
});

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

    await expect(
      adapter.readMetadata(await createPdf(1)),
    ).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Reading PDF metadata is not implemented yet.",
    });
  });

  it("validates split ranges before reporting unsupported processing", async () => {
    const adapter = new StubLocalPdfAdapter();
    const samplePdfBytes = await createPdf(1);

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
      adapter.merge({ documents: [await createPdf(1), await createPdf(1)] }),
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
