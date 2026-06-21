import { describe, expect, it, vi } from "vitest";

import { PdfProcessingError, type PdfAdapter } from "@localfiles/pdf";

import {
  buildMergeFileItem,
  compareNaturalFilenames,
  getPdfErrorMessage,
  mergeFiles,
  moveMergeFile,
  removeMergeFile,
  sortFilesByNaturalFilename,
  validatePdfFile,
  type MergeFileItem,
} from "./mergeWorkflow";

function createFile(name: string, type = "application/pdf") {
  return new File(["%PDF- test"], name, { type });
}

function createItem(id: string, name: string): MergeFileItem {
  return {
    id,
    file: createFile(name),
    bytes: new Uint8Array([id.charCodeAt(0)]),
    metadata: { pageCount: 1 },
    status: "ready",
  };
}

function createAdapter(): PdfAdapter {
  return {
    name: "test-adapter",
    readMetadata: vi.fn(async () => ({ pageCount: 2 })),
    split: vi.fn(),
    merge: vi.fn(async () => new Uint8Array([1, 2, 3])),
    reorder: vi.fn(),
    rotate: vi.fn(),
    deletePages: vi.fn(),
    removeMetadata: vi.fn(),
  };
}

describe("validatePdfFile", () => {
  it("accepts PDF files", () => {
    expect(validatePdfFile(createFile("a.pdf"))).toEqual({ valid: true });
  });

  it("rejects non-PDF files", () => {
    expect(validatePdfFile(createFile("notes.txt", "text/plain"))).toEqual({
      valid: false,
      message: "notes.txt is not a PDF file.",
    });
  });
});

describe("natural filename sorting", () => {
  function sortNames(names: readonly string[]) {
    return sortFilesByNaturalFilename(names.map((name) => ({ name }))).map(
      ({ name }) => name,
    );
  }

  it("compares numeric filename segments numerically", () => {
    expect(sortNames(["page-10.pdf", "page-2.pdf", "page-1.pdf"])).toEqual([
      "page-1.pdf",
      "page-2.pdf",
      "page-10.pdf",
    ]);
    expect(sortNames(["page-010.pdf", "page-002.pdf", "page-001.pdf"])).toEqual(
      ["page-001.pdf", "page-002.pdf", "page-010.pdf"],
    );
    expect(
      sortNames(["part-10-pages-64-70.pdf", "part-2-pages-8-14.pdf"]),
    ).toEqual(["part-2-pages-8-14.pdf", "part-10-pages-64-70.pdf"]);
  });

  it("keeps LocalFiles-generated filenames in natural order", () => {
    const pages = Array.from(
      { length: 10 },
      (_, index) => `page-${String(index + 1).padStart(3, "0")}.pdf`,
    );
    const parts = Array.from({ length: 10 }, (_, index) => {
      const part = String(index + 1).padStart(3, "0");
      const firstPage = index * 7 + 1;
      return `part-${part}-pages-${firstPage}-${firstPage + 6}.pdf`;
    });

    expect(sortNames([...pages].reverse())).toEqual(pages);
    expect(sortNames([...parts].reverse())).toEqual(parts);
  });

  it("sorts mixed names predictably without locale-dependent comparison", () => {
    expect(
      sortNames(["page-10.pdf", "notes.pdf", "page-2.pdf", "invoice.pdf"]),
    ).toEqual(["invoice.pdf", "notes.pdf", "page-2.pdf", "page-10.pdf"]);
  });

  it("is stable for leading-zero and casing-equivalent keys", () => {
    const files = [
      { name: "page-01.pdf", marker: "first" },
      { name: "PAGE-1.PDF", marker: "second" },
      { name: "page-001.pdf", marker: "third" },
    ];

    expect(compareNaturalFilenames("page-1.pdf", "page-01.pdf")).toBe(0);
    expect(
      sortFilesByNaturalFilename(files).map(({ marker }) => marker),
    ).toEqual(["first", "second", "third"]);
  });

  it("does not mutate the input batch", () => {
    const files = [{ name: "page-10.pdf" }, { name: "page-2.pdf" }];

    expect(sortFilesByNaturalFilename(files).map(({ name }) => name)).toEqual([
      "page-2.pdf",
      "page-10.pdf",
    ]);
    expect(files.map(({ name }) => name)).toEqual([
      "page-10.pdf",
      "page-2.pdf",
    ]);
  });
});

describe("merge file ordering", () => {
  it("moves files up and down without mutating input", () => {
    const files = [
      createItem("a", "a.pdf"),
      createItem("b", "b.pdf"),
      createItem("c", "c.pdf"),
    ];

    expect(moveMergeFile(files, "b", "up").map((file) => file.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(moveMergeFile(files, "b", "down").map((file) => file.id)).toEqual([
      "a",
      "c",
      "b",
    ]);
    expect(files.map((file) => file.id)).toEqual(["a", "b", "c"]);
  });

  it("removes files without mutating input", () => {
    const files = [createItem("a", "a.pdf"), createItem("b", "b.pdf")];

    expect(removeMergeFile(files, "a").map((file) => file.id)).toEqual(["b"]);
    expect(files.map((file) => file.id)).toEqual(["a", "b"]);
  });
});

describe("buildMergeFileItem", () => {
  it("reads metadata through the adapter", async () => {
    const adapter = createAdapter();
    const item = await buildMergeFileItem(
      createFile("a.pdf"),
      adapter,
      () => "a",
    );

    expect(item.id).toBe("a");
    expect(item.metadata?.pageCount).toBe(2);
    expect(adapter.readMetadata).toHaveBeenCalledOnce();
  });
});

describe("mergeFiles", () => {
  it("merges files in current order through the adapter", async () => {
    const adapter = createAdapter();
    const files = [createItem("b", "b.pdf"), createItem("a", "a.pdf")];
    const result = await mergeFiles(files, adapter);

    expect(result.filename).toBe("localfiles-merged.pdf");
    expect(result.bytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(adapter.merge).toHaveBeenCalledWith({
      documents: [files[0].bytes, files[1].bytes],
    });
  });

  it("rejects empty input", async () => {
    await expect(mergeFiles([], createAdapter())).rejects.toThrow(
      "Add at least one PDF before merging.",
    );
  });

  it("maps adapter errors to user-facing messages", () => {
    expect(
      getPdfErrorMessage(
        new PdfProcessingError("encrypted-document", "encrypted"),
      ),
    ).toBe("Password-protected PDFs are not supported yet.");
  });

  it("does not expose unexpected raw error messages", () => {
    expect(getPdfErrorMessage(new Error("internal parser exploded"))).toBe(
      "The PDF operation failed. Try again with different PDF files.",
    );
  });
});
