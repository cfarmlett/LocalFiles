import { describe, expect, it, vi } from "vitest";

import { PdfProcessingError, type PdfAdapter } from "@localdocs/pdf";

import {
  buildMergeFileItem,
  getPdfErrorMessage,
  mergeFiles,
  moveMergeFile,
  removeMergeFile,
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

    expect(result.filename).toBe("localdocs-merged.pdf");
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
