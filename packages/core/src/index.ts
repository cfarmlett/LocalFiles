export type DocumentId = string;

export type PageNumber = number;

export type PageRange = Readonly<{
  start: PageNumber;
  end: PageNumber;
}>;

export type SplitPlan = Readonly<{
  documentId: DocumentId;
  ranges: readonly PageRange[];
}>;

export type MergePlanItem = Readonly<{
  documentId: DocumentId;
  ranges?: readonly PageRange[];
}>;

export type MergePlan = Readonly<{
  documents: readonly MergePlanItem[];
}>;

export type RedactionRegion = Readonly<{
  page: PageNumber;
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type ValidationResult =
  | Readonly<{
      valid: true;
      errors: readonly [];
    }>
  | Readonly<{
      valid: false;
      errors: readonly string[];
    }>;

export type PageRangeValidationOptions = Readonly<{
  pageCount?: number;
}>;

export type LocalProcessingPolicy = Readonly<{
  allowsUpload: false;
  analytics: false;
  telemetry: false;
}>;

export const localProcessingPolicy: LocalProcessingPolicy = {
  allowsUpload: false,
  analytics: false,
  telemetry: false,
};

const validResult: ValidationResult = {
  valid: true,
  errors: [],
};

export function validatePageRange(
  range: PageRange,
  options: PageRangeValidationOptions = {},
): ValidationResult {
  return toValidationResult(getPageRangeErrors(range, options, false));
}

export function normalizePageRange(
  range: PageRange,
  options: PageRangeValidationOptions = {},
): PageRange {
  assertPageRangeLike(range);

  const start = Math.min(range.start, range.end);
  const end = Math.max(range.start, range.end);
  const normalized = { start, end };
  const validation = validatePageRange(normalized, options);

  if (!validation.valid) {
    throw new RangeError(`Invalid page range: ${validation.errors.join(" ")}`);
  }

  return normalized;
}

export function validatePageRanges(
  ranges: readonly PageRange[],
  options: PageRangeValidationOptions = {},
): ValidationResult {
  if (!Array.isArray(ranges)) {
    return toValidationResult(["Page ranges must be an array."]);
  }

  if (ranges.length === 0) {
    return toValidationResult(["At least one page range is required."]);
  }

  const errors = ranges.flatMap((range, index) =>
    getPageRangeErrors(range, options, false).map(
      (error) => `Range ${index + 1}: ${error}`,
    ),
  );

  return toValidationResult(errors);
}

export function normalizePageRanges(
  ranges: readonly PageRange[],
  options: PageRangeValidationOptions = {},
): PageRange[] {
  if (!Array.isArray(ranges)) {
    throw new RangeError("Invalid page ranges: Page ranges must be an array.");
  }

  if (ranges.length === 0) {
    throw new RangeError(
      "Invalid page ranges: At least one page range is required.",
    );
  }

  const normalizedRanges = ranges
    .map((range) => normalizePageRange(range, options))
    .sort((left, right) => left.start - right.start || left.end - right.end);

  return mergePageRanges(normalizedRanges);
}

function getPageRangeErrors(
  range: PageRange,
  options: PageRangeValidationOptions,
  allowReversed: boolean,
): string[] {
  const errors: string[] = [];

  if (!isRecord(range)) {
    return ["Page range must be an object with start and end page numbers."];
  }

  if (!isPositiveInteger(range.start)) {
    errors.push("Page range start must be a positive integer.");
  }

  if (!isPositiveInteger(range.end)) {
    errors.push("Page range end must be a positive integer.");
  }

  if (errors.length > 0) {
    return errors;
  }

  if (!allowReversed && range.start > range.end) {
    errors.push("Page range start must be less than or equal to end.");
  }

  if (options.pageCount !== undefined) {
    if (!isPositiveInteger(options.pageCount)) {
      errors.push("Page count must be a positive integer when provided.");
    } else if (Math.max(range.start, range.end) > options.pageCount) {
      errors.push(
        `Page range end must be less than or equal to page count (${options.pageCount}).`,
      );
    }
  }

  return errors;
}

function mergePageRanges(ranges: readonly PageRange[]): PageRange[] {
  return ranges.reduce<PageRange[]>((merged, range) => {
    const previous = merged.at(-1);

    if (previous === undefined || range.start > previous.end + 1) {
      return [...merged, range];
    }

    return [
      ...merged.slice(0, -1),
      {
        start: previous.start,
        end: Math.max(previous.end, range.end),
      },
    ];
  }, []);
}

function assertPageRangeLike(range: PageRange): void {
  if (!isRecord(range)) {
    throw new RangeError(
      "Invalid page range: Page range must be an object with start and end page numbers.",
    );
  }
}

function toValidationResult(errors: readonly string[]): ValidationResult {
  if (errors.length === 0) {
    return validResult;
  }

  return {
    valid: false,
    errors,
  };
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
