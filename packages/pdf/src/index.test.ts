import { describe, expect, it } from "vitest";
import { PDFDocument, degrees } from "pdf-lib";

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

async function createPdfWithPageSizes(
  sizes: readonly (readonly [number, number])[],
): Promise<Uint8Array> {
  const document = await PDFDocument.create();

  sizes.forEach(([width, height]) => document.addPage([width, height]));

  return document.save();
}

async function readPageSizes(
  documentBytes: Uint8Array,
): Promise<readonly (readonly [number, number])[]> {
  const document = await PDFDocument.load(documentBytes);

  return document.getPages().map((page) => {
    const size = page.getSize();

    return [size.width, size.height] as const;
  });
}

async function readPageRotations(
  documentBytes: Uint8Array,
): Promise<readonly number[]> {
  const document = await PDFDocument.load(documentBytes);

  return document.getPages().map((page) => page.getRotation().angle);
}

const invalidPdfBytes = new Uint8Array([37, 80, 68, 70, 45]);

describe("LocalPdfAdapter", () => {
  it("reads page count metadata locally", async () => {
    const adapter = new LocalPdfAdapter();
    const metadata = await adapter.readMetadata(await createPdf(2));

    expect(metadata.pageCount).toBe(2);
    expect(metadata.pageRotations).toEqual([0, 0]);
  });

  it("reads existing page rotations in metadata", async () => {
    const adapter = new LocalPdfAdapter();
    const document = await PDFDocument.create();
    document.addPage();
    document.addPage().setRotation(degrees(90));
    document.addPage().setRotation(degrees(270));

    const metadata = await adapter.readMetadata(await document.save());

    expect(metadata.pageCount).toBe(3);
    expect(metadata.pageRotations).toEqual([0, 90, 270]);
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

  it("reorders PDF pages into one output document", async () => {
    const adapter = new LocalPdfAdapter();
    const pageSizes = [
      [200, 300],
      [400, 500],
      [600, 700],
    ] as const;
    const reordered = await adapter.reorder({
      document: await createPdfWithPageSizes(pageSizes),
      pageOrder: [3, 2, 1],
    });

    await expect(adapter.readMetadata(reordered)).resolves.toMatchObject({
      pageCount: 3,
    });
    await expect(readPageSizes(reordered)).resolves.toEqual([
      pageSizes[2],
      pageSizes[1],
      pageSizes[0],
    ]);
  });

  it("rejects reorder requests that duplicate or omit pages", async () => {
    const adapter = new LocalPdfAdapter();
    const document = await createPdf(3);

    await expect(
      adapter.reorder({
        document,
        pageOrder: [1, 1, 3],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message: "Page order must include every page exactly once.",
    });

    await expect(
      adapter.reorder({
        document,
        pageOrder: [1, 2],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message: "Page order must include every page exactly once.",
    });
  });

  it("rotates selected PDF pages without reordering pages", async () => {
    const adapter = new LocalPdfAdapter();
    const document = await PDFDocument.create();
    document.addPage([200, 300]);
    document.addPage([400, 500]).setRotation(degrees(90));
    document.addPage([600, 700]);

    const rotated = await adapter.rotate({
      document: await document.save(),
      rotations: [
        { pageNumber: 1, rotation: 90 },
        { pageNumber: 2, rotation: -180 },
      ],
    });

    await expect(readPageSizes(rotated)).resolves.toEqual([
      [200, 300],
      [400, 500],
      [600, 700],
    ]);
    await expect(readPageRotations(rotated)).resolves.toEqual([90, 180, 0]);
  });

  it("deletes selected PDF pages while preserving remaining page order", async () => {
    const adapter = new LocalPdfAdapter();
    const pageSizes = [
      [200, 300],
      [400, 500],
      [600, 700],
      [800, 900],
      [1000, 1100],
    ] as const;
    const output = await adapter.deletePages({
      document: await createPdfWithPageSizes(pageSizes),
      pageNumbers: [2, 4],
    });

    await expect(adapter.readMetadata(output)).resolves.toMatchObject({
      pageCount: 3,
    });
    await expect(readPageSizes(output)).resolves.toEqual([
      pageSizes[0],
      pageSizes[2],
      pageSizes[4],
    ]);
  });

  it("rejects delete requests that remove every page", async () => {
    const adapter = new LocalPdfAdapter();

    await expect(
      adapter.deletePages({
        document: await createPdf(2),
        pageNumbers: [1, 2],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message: "At least one page must remain in the output PDF.",
    });
  });

  it("rejects invalid rotate requests", async () => {
    const adapter = new LocalPdfAdapter();
    const document = await createPdf(2);

    await expect(
      adapter.rotate({
        document,
        rotations: [{ pageNumber: 1, rotation: 45 }],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message:
        "Page rotations must use unique page numbers and quarter-turn rotations.",
    });

    await expect(
      adapter.rotate({
        document,
        rotations: [
          { pageNumber: 1, rotation: 90 },
          { pageNumber: 1, rotation: 180 },
        ],
      }),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
      message:
        "Page rotations must use unique page numbers and quarter-turn rotations.",
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
    expect(typeof adapter.reorder).toBe("function");
    expect(typeof adapter.rotate).toBe("function");
    expect(typeof adapter.deletePages).toBe("function");
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

  it("validates reorder inputs before reporting unsupported processing", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(
      adapter.reorder(null as unknown as Parameters<PdfAdapter["reorder"]>[0]),
    ).rejects.toMatchObject({
      code: "invalid-document",
      message: "PDF reorder request must be an object.",
    });

    await expect(
      adapter.reorder({
        document: await createPdf(1),
        pageOrder: [1],
      }),
    ).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Reordering PDF pages is not implemented yet.",
    });
  });

  it("validates rotate inputs before reporting unsupported processing", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(
      adapter.rotate(null as unknown as Parameters<PdfAdapter["rotate"]>[0]),
    ).rejects.toMatchObject({
      code: "invalid-document",
      message: "PDF rotate request must be an object.",
    });

    await expect(
      adapter.rotate({
        document: await createPdf(1),
        rotations: [{ pageNumber: 1, rotation: 90 }],
      }),
    ).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Rotating PDF pages is not implemented yet.",
    });
  });

  it("validates delete inputs before reporting unsupported processing", async () => {
    const adapter = new StubLocalPdfAdapter();

    await expect(
      adapter.deletePages(
        null as unknown as Parameters<PdfAdapter["deletePages"]>[0],
      ),
    ).rejects.toMatchObject({
      code: "invalid-document",
      message: "PDF delete pages request must be an object.",
    });

    await expect(
      adapter.deletePages({
        document: await createPdf(2),
        pageNumbers: [1],
      }),
    ).rejects.toMatchObject({
      code: "unsupported-operation",
      message: "Deleting PDF pages is not implemented yet.",
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
