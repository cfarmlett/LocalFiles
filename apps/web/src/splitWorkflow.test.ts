import { describe, expect, it, vi } from "vitest";

import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfPageRange,
} from "@localfiles/pdf";

import {
  buildSplitFileItem,
  createSplitPlan,
  formatSplitSequenceNumber,
  getSplitErrorMessage,
  splitFile,
  type SplitFileItem,
} from "./splitWorkflow";

describe("formatSplitSequenceNumber", () => {
  it.each([
    [1, 1, "1"],
    [8, 8, "8"],
    [1, 10, "01"],
    [10, 10, "10"],
    [1, 99, "01"],
    [99, 99, "99"],
    [1, 100, "001"],
    [100, 100, "100"],
    [999, 999, "999"],
  ])("formats sequence %i of %i as %s", (sequence, total, expected) => {
    expect(formatSplitSequenceNumber(sequence, total)).toBe(expected);
  });
});

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
    reorder: vi.fn(),
    rotate: vi.fn(),
    deletePages: vi.fn(),
    removeMetadata: vi.fn(),
  };
}

describe("createSplitPlan", () => {
  it("plans one output for every page when the interval is 1", () => {
    expect(createSplitPlan("interval", 3, { interval: 1 })).toEqual({
      ranges: [
        { start: 1, end: 1 },
        { start: 2, end: 2 },
        { start: 3, end: 3 },
      ],
      filenames: ["page-1.pdf", "page-2.pdf", "page-3.pdf"],
    });
  });

  it("zero-pads every-page output names without changing their ranges", () => {
    const plan = createSplitPlan("interval", 12, { interval: 1 });

    expect(plan.filenames).toEqual([
      "page-01.pdf",
      "page-02.pdf",
      "page-03.pdf",
      "page-04.pdf",
      "page-05.pdf",
      "page-06.pdf",
      "page-07.pdf",
      "page-08.pdf",
      "page-09.pdf",
      "page-10.pdf",
      "page-11.pdf",
      "page-12.pdf",
    ]);
    expect(plan.ranges).toEqual(
      Array.from({ length: 12 }, (_, index) => ({
        start: index + 1,
        end: index + 1,
      })),
    );
  });

  it("plans a one-page PDF as one interval output", () => {
    expect(createSplitPlan("interval", 1, { interval: 1 })).toEqual({
      ranges: [{ start: 1, end: 1 }],
      filenames: ["page-1.pdf"],
    });
  });

  it("plans interval chunks including a short final chunk", () => {
    expect(createSplitPlan("interval", 12, { interval: 5 })).toEqual({
      ranges: [
        { start: 1, end: 5 },
        { start: 6, end: 10 },
        { start: 11, end: 12 },
      ],
      filenames: [
        "part-1-pages-1-5.pdf",
        "part-2-pages-6-10.pdf",
        "part-3-pages-11-12.pdf",
      ],
    });
  });

  it("prefixes every-N page ranges with sortable padded part numbers", () => {
    const plan = createSplitPlan("interval", 120, { interval: 10 });

    expect(plan.filenames).toEqual([
      "part-01-pages-1-10.pdf",
      "part-02-pages-11-20.pdf",
      "part-03-pages-21-30.pdf",
      "part-04-pages-31-40.pdf",
      "part-05-pages-41-50.pdf",
      "part-06-pages-51-60.pdf",
      "part-07-pages-61-70.pdf",
      "part-08-pages-71-80.pdf",
      "part-09-pages-81-90.pdf",
      "part-10-pages-91-100.pdf",
      "part-11-pages-101-110.pdf",
      "part-12-pages-111-120.pdf",
    ]);
    expect([...plan.filenames].sort()).toEqual(plan.filenames);
    expect(plan.ranges).toHaveLength(12);
    expect(plan.ranges.at(-1)).toEqual({ start: 111, end: 120 });
  });

  it("plans one interval chunk when the interval is larger than page count", () => {
    expect(createSplitPlan("interval", 3, { interval: 10 })).toEqual({
      ranges: [{ start: 1, end: 3 }],
      filenames: ["part-1-pages-1-3.pdf"],
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

  it("zero-pads custom-range part numbers without changing range labels", () => {
    const customRanges = Array.from(
      { length: 12 },
      (_, index) => `${index + 1}`,
    ).join(",");
    const plan = createSplitPlan("custom-ranges", 12, { customRanges });

    expect(plan.filenames[0]).toBe("part-01-pages-1-1.pdf");
    expect(plan.filenames[8]).toBe("part-09-pages-9-9.pdf");
    expect(plan.filenames[11]).toBe("part-12-pages-12-12.pdf");
    expect([...plan.filenames].sort()).toEqual(plan.filenames);
    expect(plan.ranges[0]).toEqual({ start: 1, end: 1 });
    expect(plan.ranges[11]).toEqual({ start: 12, end: 12 });
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

  it.each([undefined, 0, -1, 1.5])(
    "rejects invalid interval %s",
    (interval) => {
      expect(() => createSplitPlan("interval", 5, { interval })).toThrow(
        "Enter a positive whole number of pages per file.",
      );
    },
  );

  it("rejects invalid custom ranges", () => {
    expect(() =>
      createSplitPlan("custom-ranges", 5, { customRanges: "4-2" }),
    ).toThrow("Range 1: Page range start must be less than or equal to end.");

    expect(() =>
      createSplitPlan("custom-ranges", 5, { customRanges: "6" }),
    ).toThrow(
      "Page range exceeds document length. This PDF contains 5 pages, but the range includes page 6.",
    );

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
    const outputs = await splitFile(createItem(), adapter, "interval", {
      interval: 2,
    });

    expect(outputs.map((output) => output.filename)).toEqual([
      "part-1-pages-1-2.pdf",
      "part-2-pages-3-4.pdf",
      "part-3-pages-5-5.pdf",
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

  it("rejects out-of-range custom ranges before adapter generation", async () => {
    const adapter = createAdapter();

    await expect(
      splitFile(createItem(), adapter, "custom-ranges", {
        customRanges: "1-3, 4-8",
      }),
    ).rejects.toThrow(
      "Page range exceeds document length. This PDF contains 5 pages, but the range includes page 8.",
    );
    expect(adapter.split).not.toHaveBeenCalled();
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
      splitFile(createItem(), adapter, "interval", { interval: 1 }),
    ).rejects.toMatchObject({
      code: "processing-failed",
    });
  });
});
