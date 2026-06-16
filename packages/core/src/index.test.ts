import { describe, expect, it } from "vitest";

import {
  localProcessingPolicy,
  normalizePageRange,
  normalizePageRanges,
  validatePageRange,
  validatePageRanges,
  type MergePlan,
  type PageRange,
  type RedactionRegion,
  type SplitPlan,
} from "./index";

describe("local processing policy", () => {
  it("defaults to no uploads, analytics, or telemetry", () => {
    expect(localProcessingPolicy).toEqual({
      allowsUpload: false,
      analytics: false,
      telemetry: false,
    });
  });
});

describe("page range validation", () => {
  it("accepts a positive ascending page range", () => {
    expect(validatePageRange({ start: 1, end: 3 })).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("accepts a single-page range", () => {
    expect(validatePageRange({ start: 4, end: 4 })).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects reversed page ranges", () => {
    expect(validatePageRange({ start: 5, end: 2 })).toEqual({
      valid: false,
      errors: ["Page range start must be less than or equal to end."],
    });
  });

  it("rejects missing, fractional, zero, and negative page numbers", () => {
    expect(
      validatePageRange({
        start: 0,
        end: 2.5,
      }),
    ).toEqual({
      valid: false,
      errors: [
        "Page range start must be a positive integer.",
        "Page range end must be a positive integer.",
      ],
    });

    expect(validatePageRange({ start: -1, end: 2 })).toEqual({
      valid: false,
      errors: ["Page range start must be a positive integer."],
    });
  });

  it("rejects non-object inputs defensively", () => {
    expect(validatePageRange(null as unknown as PageRange)).toEqual({
      valid: false,
      errors: ["Page range must be an object with start and end page numbers."],
    });
  });

  it("honors an optional page count", () => {
    expect(validatePageRange({ start: 2, end: 5 }, { pageCount: 4 })).toEqual({
      valid: false,
      errors: ["Page range end must be less than or equal to page count (4)."],
    });

    expect(validatePageRange({ start: 2, end: 4 }, { pageCount: 4 })).toEqual({
      valid: true,
      errors: [],
    });
  });

  it("rejects invalid page counts", () => {
    expect(validatePageRange({ start: 1, end: 2 }, { pageCount: 0 })).toEqual({
      valid: false,
      errors: ["Page count must be a positive integer when provided."],
    });
  });
});

describe("page range normalization", () => {
  it("returns a new ascending page range without mutating input", () => {
    const input: PageRange = Object.freeze({ start: 8, end: 3 });

    expect(normalizePageRange(input)).toEqual({ start: 3, end: 8 });
    expect(input).toEqual({ start: 8, end: 3 });
  });

  it("throws with validation messages for invalid ranges", () => {
    expect(() =>
      normalizePageRange({ start: 1, end: 9 }, { pageCount: 5 }),
    ).toThrow("Page range end must be less than or equal to page count (5).");
  });
});

describe("page range list validation", () => {
  it("rejects non-arrays and empty arrays", () => {
    expect(validatePageRanges(null as unknown as readonly PageRange[])).toEqual(
      {
        valid: false,
        errors: ["Page ranges must be an array."],
      },
    );

    expect(validatePageRanges([])).toEqual({
      valid: false,
      errors: ["At least one page range is required."],
    });
  });

  it("labels errors by one-based range position", () => {
    expect(
      validatePageRanges([
        { start: 1, end: 2 },
        { start: 4, end: 3 },
        { start: 0, end: 5 },
      ]),
    ).toEqual({
      valid: false,
      errors: [
        "Range 2: Page range start must be less than or equal to end.",
        "Range 3: Page range start must be a positive integer.",
      ],
    });
  });
});

describe("page range list normalization", () => {
  it("sorts and merges overlapping or contiguous ranges", () => {
    const input: readonly PageRange[] = Object.freeze([
      Object.freeze({ start: 10, end: 12 }),
      Object.freeze({ start: 2, end: 5 }),
      Object.freeze({ start: 7, end: 6 }),
      Object.freeze({ start: 5, end: 5 }),
    ]);

    expect(normalizePageRanges(input)).toEqual([
      { start: 2, end: 7 },
      { start: 10, end: 12 },
    ]);
    expect(input).toEqual([
      { start: 10, end: 12 },
      { start: 2, end: 5 },
      { start: 7, end: 6 },
      { start: 5, end: 5 },
    ]);
  });

  it("throws for empty range lists", () => {
    expect(() => normalizePageRanges([])).toThrow(
      "At least one page range is required.",
    );
  });
});

describe("planning types", () => {
  it("can describe split, merge, and redaction planning shapes", () => {
    const splitPlan: SplitPlan = {
      documentId: "document-a",
      ranges: [{ start: 1, end: 2 }],
    };
    const mergePlan: MergePlan = {
      documents: [
        { documentId: "document-a", ranges: [{ start: 1, end: 2 }] },
        { documentId: "document-b" },
      ],
    };
    const redactionRegion: RedactionRegion = {
      page: 1,
      x: 10,
      y: 20,
      width: 100,
      height: 40,
    };

    expect(splitPlan.ranges).toHaveLength(1);
    expect(mergePlan.documents).toHaveLength(2);
    expect(redactionRegion).toMatchObject({ page: 1, width: 100 });
  });
});
