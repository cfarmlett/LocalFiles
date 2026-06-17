import { describe, expect, it, vi } from "vitest";

import { PdfProcessingError, type PdfAdapter } from "@localdocs/pdf";

import {
  allPagesDeleted,
  buildDeleteFileItem,
  createDefaultDeletePages,
  createPagesDeletedFilename,
  deletePagesFile,
  getDeleteErrorMessage,
  getRemainingPageNumbers,
  markPageDeleted,
  restorePage,
  type DeleteFileItem,
} from "./deleteWorkflow";

function createFile(name: string, type = "application/pdf") {
  return new File(["%PDF- test"], name, { type });
}

function createItem(): DeleteFileItem {
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
    reorder: vi.fn(),
    rotate: vi.fn(),
    deletePages: vi.fn(async () => new Uint8Array([9, 8, 7])),
    removeMetadata: vi.fn(),
  };
}

describe("createDefaultDeletePages", () => {
  it("creates one-based page rows with no pages marked", () => {
    expect(createDefaultDeletePages(3)).toEqual([
      { id: "page-1", pageNumber: 1, deleted: false },
      { id: "page-2", pageNumber: 2, deleted: false },
      { id: "page-3", pageNumber: 3, deleted: false },
    ]);
  });
});

describe("delete page state", () => {
  it("marks and restores a page without mutating input", () => {
    const pages = createDefaultDeletePages(2);
    const marked = markPageDeleted(pages, "page-1");
    const restored = restorePage(marked, "page-1");

    expect(marked[0].deleted).toBe(true);
    expect(restored[0].deleted).toBe(false);
    expect(pages[0].deleted).toBe(false);
  });

  it("keeps state correct after repeated delete and restore actions", () => {
    const pages = createDefaultDeletePages(2);
    const marked = markPageDeleted(pages, "page-1");
    const restored = restorePage(marked, "page-1");
    const markedAgain = markPageDeleted(restored, "page-1");

    expect(markedAgain).toEqual([
      { id: "page-1", pageNumber: 1, deleted: true },
      { id: "page-2", pageNumber: 2, deleted: false },
    ]);
  });

  it("preserves remaining page order", () => {
    const pages = markPageDeleted(createDefaultDeletePages(4), "page-2");

    expect(getRemainingPageNumbers(pages)).toEqual([1, 3, 4]);
  });

  it("detects when all pages are marked for deletion", () => {
    const pages = createDefaultDeletePages(2).map(
      (page) => markPageDeleted([page], page.id)[0],
    );

    expect(allPagesDeleted(pages)).toBe(true);
  });
});

describe("buildDeleteFileItem", () => {
  it("reads metadata through the adapter", async () => {
    const adapter = createAdapter();
    const item = await buildDeleteFileItem(
      createFile("sample.pdf"),
      adapter,
      () => "sample",
    );

    expect(item.id).toBe("sample");
    expect(item.metadata.pageCount).toBe(3);
    expect(adapter.readMetadata).toHaveBeenCalledOnce();
  });
});

describe("deletePagesFile", () => {
  it("calls the adapter with pages marked for deletion", async () => {
    const adapter = createAdapter();
    const pages = markPageDeleted(createDefaultDeletePages(3), "page-2");
    const result = await deletePagesFile(createItem(), adapter, pages);

    expect(result.filename).toBe("sample-pages-deleted.pdf");
    expect(result.bytes).toEqual(new Uint8Array([9, 8, 7]));
    expect(adapter.deletePages).toHaveBeenCalledWith({
      document: createItem().bytes,
      pageNumbers: [2],
    });
  });

  it("prevents deleting all pages before adapter generation", async () => {
    const adapter = createAdapter();
    const pages = createDefaultDeletePages(3).map((page) => ({
      ...page,
      deleted: true,
    }));

    await expect(deletePagesFile(createItem(), adapter, pages)).rejects.toThrow(
      "Restore at least one page before generating a PDF.",
    );
    expect(adapter.deletePages).not.toHaveBeenCalled();
  });

  it("maps adapter delete errors to safe user-facing messages", () => {
    expect(
      getDeleteErrorMessage(
        new PdfProcessingError("encrypted-document", "internal encrypted"),
      ),
    ).toBe("Password-protected PDFs are not supported yet.");
  });
});

describe("createPagesDeletedFilename", () => {
  it("generates deterministic user-friendly output names", () => {
    expect(createPagesDeletedFilename("original.pdf")).toBe(
      "original-pages-deleted.pdf",
    );
    expect(createPagesDeletedFilename("Document.PDF")).toBe(
      "Document-pages-deleted.pdf",
    );
    expect(createPagesDeletedFilename("")).toBe("document-pages-deleted.pdf");
  });
});
