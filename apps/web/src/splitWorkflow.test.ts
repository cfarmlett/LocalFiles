import { describe, expect, it, vi } from "vitest";

import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfPageRange,
} from "@localdocs/pdf";

import {
  buildSplitFileItem,
  createSplitPlan,
  getSplitErrorMessage,
  splitFile,
  type SplitFileItem,
} from "./splitWorkflow";

function createFile(name: string, type = "application/pdf") {
  return new File(["%PDF- test"], name, { type });
}

function createItem(): SplitFileItem {
  return {
    id: "a",
    file: createFile("sample.pdf"),
    bytes: new Uint8Array([1, 2, 3]),
    metadata: { pageCount: 5 },
  };
}

function createAdapter(): PdfAdapter {
  return {
    name: "test-adapter",
    readMetadata: vi.fn(async () => ({ pageCount: 5 })),
    split: vi.fn(async ({ ranges }: { ranges: readonly PdfPageRange[] }) =>
      ranges.map((range) => new Uint8Array([range.start, range.end])),
    ),
    merge: vi.fn(),
  };
}

describe("createSplitPlan", () => {
  it("plans one output for every page", () => {
    expect(createSplitPlan("every-page", 3)).toEqual({
      ranges: [
        { start: 1, end: 1 },
        { start: 2, end: 2 },
        { start: 3, end: 3 },
      ],
      filenames: ["page-1.pdf", "page-2.pdf", "page-3.pdf"],
    });
  });

  it("plans a one-page PDF as one every-page output", () => {
    expect(createSplitPlan("every-page", 1)).toEqual({
      ranges: [{ start: 1, end: 1 }],
      filenames: ["page-1.pdf"],
    });
  });

  it("plans every-N-page chunks including a short final chunk", () => {
    expect(createSplitPlan("every-n-pages", 12, { chunkSize: 5 })).toEqual({
      ranges: [
        { start: 1, end: 5 },
        { start: 6, end: 10 },
        { start: 11, end: 12 },
      ],
      filenames: ["pages-1-5.pdf", "pages-6-10.pdf", "pages-11-12.pdf"],
    });
  });

  it("plans one every-N-page chunk when chunk size is larger than page count", () => {
    expect(createSplitPlan("every-n-pages", 3, { chunkSize: 10 })).toEqual({
      ranges: [{ start: 1, end: 3 }],
      filenames: ["pages-1-3.pdf"],
    });
  });

  it("plans custom ranges with deterministic part names", () => {
    expect(
      createSplitPlan("custom-ranges", 20, {
        customRanges: "1-3\n4-10, 11-20",
      }),
    ).toEqual({
      ranges: [
        { start: 1, end: 3 },
        { start: 4, end: 10 },
        { start: 11, end: 20 },
      ],
      filenames: [
        "part-1-pages-1-3.pdf",
        "part-2-pages-4-10.pdf",
        "part-3-pages-11-20.pdf",
      ],
    });
  });

  it("preserves duplicate and overlapping custom ranges as separate outputs", () => {
    expect(
      createSplitPlan("custom-ranges", 5, {
        customRanges: "1-3, 1-3, 2-4",
      }),
    ).toEqual({
      ranges: [
        { start: 1, end: 3 },
        { start: 1, end: 3 },
        { start: 2, end: 4 },
      ],
      filenames: [
        "part-1-pages-1-3.pdf",
        "part-2-pages-1-3.pdf",
        "part-3-pages-2-4.pdf",
      ],
    });
  });

  it("rejects invalid chunk sizes", () => {
    expect(() => createSplitPlan("every-n-pages", 5, { chunkSize: 0 })).toThrow(
      "Enter a positive whole number of pages per file.",
    );
  });

  it("rejects invalid custom ranges", () => {
    expect(() =>
      createSplitPlan("custom-ranges", 5, { customRanges: "4-2" }),
    ).toThrow("Range 1: Page range start must be less than or equal to end.");

    expect(() =>
      createSplitPlan("custom-ranges", 5, { customRanges: "6" }),
    ).toThrow("Range 1: Page range end must be less than or equal");

    expect(() =>
      createSplitPlan("custom-ranges", 5, { customRanges: "one" }),
    ).toThrow("Use page ranges like 1-3");
  });
});

describe("buildSplitFileItem", () => {
  it("selects one PDF and reads metadata through the adapter", async () => {
    const adapter = createAdapter();
    const item = await buildSplitFileItem(
      createFile("sample.pdf"),
      adapter,
      () => "sample",
    );

    expect(item.id).toBe("sample");
    expect(item.metadata.pageCount).toBe(5);
    expect(adapter.readMetadata).toHaveBeenCalledOnce();
  });
});

describe("splitFile", () => {
  it("calls the adapter and maps output names", async () => {
    const adapter = createAdapter();
    const outputs = await splitFile(createItem(), adapter, "every-n-pages", {
      chunkSize: 2,
    });

    expect(outputs.map((output) => output.filename)).toEqual([
      "pages-1-2.pdf",
      "pages-3-4.pdf",
      "pages-5-5.pdf",
    ]);
    expect(adapter.split).toHaveBeenCalledWith({
      document: createItem().bytes,
      ranges: [
        { start: 1, end: 2 },
        { start: 3, end: 4 },
        { start: 5, end: 5 },
      ],
    });
  });

  it("maps adapter split errors to safe user-facing messages", () => {
    expect(
      getSplitErrorMessage(
        new PdfProcessingError("encrypted-document", "internal encrypted"),
      ),
    ).toBe("Password-protected PDFs are not supported yet.");
  });

  it("reports an adapter output count mismatch as a failure", async () => {
    const adapter = {
      ...createAdapter(),
      split: vi.fn(async () => [new Uint8Array([1])]),
    };

    await expect(
      splitFile(createItem(), adapter, "every-page"),
    ).rejects.toMatchObject({
      code: "processing-failed",
    });
  });
});
