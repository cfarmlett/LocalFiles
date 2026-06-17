import { describe, expect, it, vi } from "vitest";

import { PdfProcessingError, type PdfAdapter } from "@localdocs/pdf";

import {
  buildReorderFileItem,
  createDefaultPageOrder,
  createReorderedFilename,
  getReorderErrorMessage,
  movePage,
  reorderFile,
  validatePageOrder,
  type ReorderFileItem,
} from "./reorderWorkflow";

function createFile(name: string, type = "application/pdf") {
  return new File(["%PDF- test"], name, { type });
}

function createItem(): ReorderFileItem {
  return {
    id: "sample",
    file: createFile("sample.pdf"),
    bytes: new Uint8Array([1, 2, 3]),
    metadata: { pageCount: 3 },
  };
}

function createAdapter(): PdfAdapter {
  return {
    name: "test-adapter",
    readMetadata: vi.fn(async () => ({ pageCount: 3 })),
    split: vi.fn(),
    merge: vi.fn(),
    reorder: vi.fn(async () => new Uint8Array([9, 8, 7])),
  };
}

describe("createDefaultPageOrder", () => {
  it("creates the default one-based page order", () => {
    expect(createDefaultPageOrder(3)).toEqual([
      { id: "page-1", pageNumber: 1 },
      { id: "page-2", pageNumber: 2 },
      { id: "page-3", pageNumber: 3 },
    ]);
  });

  it("rejects unreadable page counts", () => {
    expect(() => createDefaultPageOrder(0)).toThrow(
      "Select a readable PDF before reordering pages.",
    );
  });
});

describe("page movement", () => {
  it("moves pages up and down without mutating input", () => {
    const pages = createDefaultPageOrder(3);

    expect(movePage(pages, "page-2", "up").map((page) => page.id)).toEqual([
      "page-2",
      "page-1",
      "page-3",
    ]);
    expect(movePage(pages, "page-2", "down").map((page) => page.id)).toEqual([
      "page-1",
      "page-3",
      "page-2",
    ]);
    expect(pages.map((page) => page.id)).toEqual([
      "page-1",
      "page-2",
      "page-3",
    ]);
  });

  it("leaves boundary moves unchanged", () => {
    const pages = createDefaultPageOrder(2);

    expect(movePage(pages, "page-1", "up")).toEqual(pages);
    expect(movePage(pages, "page-2", "down")).toEqual(pages);
  });
});

describe("validatePageOrder", () => {
  it("accepts a complete permutation", () => {
    expect(
      validatePageOrder(
        [
          { id: "page-3", pageNumber: 3 },
          { id: "page-1", pageNumber: 1 },
          { id: "page-2", pageNumber: 2 },
        ],
        3,
      ),
    ).toBe(true);
  });

  it("rejects duplicate, missing, and out-of-range pages", () => {
    expect(
      validatePageOrder(
        [
          { id: "a", pageNumber: 1 },
          { id: "b", pageNumber: 1 },
        ],
        2,
      ),
    ).toBe(false);
    expect(validatePageOrder([{ id: "a", pageNumber: 1 }], 2)).toBe(false);
    expect(
      validatePageOrder(
        [
          { id: "a", pageNumber: 1 },
          { id: "b", pageNumber: 3 },
        ],
        2,
      ),
    ).toBe(false);
  });
});

describe("buildReorderFileItem", () => {
  it("reads metadata through the adapter", async () => {
    const adapter = createAdapter();
    const item = await buildReorderFileItem(
      createFile("sample.pdf"),
      adapter,
      () => "sample",
    );

    expect(item.id).toBe("sample");
    expect(item.metadata.pageCount).toBe(3);
    expect(adapter.readMetadata).toHaveBeenCalledOnce();
  });
});

describe("reorderFile", () => {
  it("calls the adapter with the selected page order", async () => {
    const adapter = createAdapter();
    const pages = movePage(createDefaultPageOrder(3), "page-3", "up");
    const result = await reorderFile(createItem(), adapter, pages);

    expect(result.filename).toBe("sample-reordered.pdf");
    expect(result.bytes).toEqual(new Uint8Array([9, 8, 7]));
    expect(adapter.reorder).toHaveBeenCalledWith({
      document: createItem().bytes,
      pageOrder: [1, 3, 2],
    });
  });

  it("rejects invalid page-order integrity before adapter generation", async () => {
    const adapter = createAdapter();

    await expect(
      reorderFile(createItem(), adapter, [
        { id: "a", pageNumber: 1 },
        { id: "b", pageNumber: 1 },
        { id: "c", pageNumber: 3 },
      ]),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
    });
    expect(adapter.reorder).not.toHaveBeenCalled();
  });

  it("maps adapter reorder errors to safe user-facing messages", () => {
    expect(
      getReorderErrorMessage(
        new PdfProcessingError("encrypted-document", "internal encrypted"),
      ),
    ).toBe("Password-protected PDFs are not supported yet.");
  });
});

describe("createReorderedFilename", () => {
  it("generates deterministic user-friendly output names", () => {
    expect(createReorderedFilename("original.pdf")).toBe(
      "original-reordered.pdf",
    );
    expect(createReorderedFilename("Document.PDF")).toBe(
      "Document-reordered.pdf",
    );
    expect(createReorderedFilename("")).toBe("reordered-document.pdf");
  });
});
