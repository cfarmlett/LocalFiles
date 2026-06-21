import { validatePageRanges, type PageRange } from "@localfiles/core";
import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "@localfiles/pdf";

import { getPdfErrorMessage, validatePdfFile } from "./mergeWorkflow";

export type SplitMode = "interval" | "custom-ranges";

export type SplitFileItem = Readonly<{
  id: string;
  file: File;
  bytes: Uint8Array;
  metadata: PdfDocumentMetadata;
}>;

export type SplitOutput = Readonly<{
  bytes: Uint8Array;
  filename: string;
  range: PageRange;
}>;

export type SplitPlan = Readonly<{
  ranges: readonly PageRange[];
  filenames: readonly string[];
}>;

export async function buildSplitFileItem(
  file: File,
  adapter: PdfAdapter,
  createId: () => string,
): Promise<SplitFileItem> {
  const validation = validatePdfFile(file);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const metadata = await adapter.readMetadata(bytes);

  return {
    id: createId(),
    file,
    bytes,
    metadata,
  };
}

export function createSplitPlan(
  mode: SplitMode,
  pageCount: number,
  options: Readonly<{
    interval?: number;
    customRanges?: string;
  }> = {},
): SplitPlan {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error("Select a readable PDF before splitting.");
  }

  if (mode === "interval") {
    const interval = options.interval;

    if (interval === undefined || !Number.isInteger(interval) || interval < 1) {
      throw new Error("Enter a positive whole number of pages per file.");
    }

    const ranges: PageRange[] = [];

    for (let start = 1; start <= pageCount; start += interval) {
      ranges.push({
        start,
        end: Math.min(start + interval - 1, pageCount),
      });
    }

    return {
      ranges,
      filenames: ranges.map((range) =>
        interval === 1
          ? `page-${range.start}.pdf`
          : `pages-${range.start}-${range.end}.pdf`,
      ),
    };
  }

  const ranges = parseCustomRanges(options.customRanges ?? "", pageCount);

  return {
    ranges,
    filenames: ranges.map(
      (range, index) =>
        `part-${index + 1}-pages-${range.start}-${range.end}.pdf`,
    ),
  };
}

export async function splitFile(
  file: SplitFileItem,
  adapter: PdfAdapter,
  mode: SplitMode,
  options: Readonly<{
    interval?: number;
    customRanges?: string;
  }> = {},
): Promise<readonly SplitOutput[]> {
  const plan = createSplitPlan(mode, file.metadata.pageCount, options);
  const outputBytes = await adapter.split({
    document: file.bytes,
    ranges: plan.ranges,
  });

  if (outputBytes.length !== plan.ranges.length) {
    throw new PdfProcessingError(
      "processing-failed",
      "The split operation returned an unexpected number of files.",
    );
  }

  return outputBytes.map((bytes, index) => ({
    bytes,
    filename: plan.filenames[index],
    range: plan.ranges[index],
  }));
}

export function getSplitErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message === "Select a readable PDF before splitting." ||
      error.message === "Enter a positive whole number of pages per file." ||
      error.message === "Enter at least one page range." ||
      error.message ===
        "Use page ranges like 1-3, 4, or 5-8, separated by commas or new lines." ||
      error.message.startsWith("Page range exceeds document length.")
    ) {
      return error.message;
    }
  }

  const message = getPdfErrorMessage(error);

  if (
    message ===
    "One of the selected PDFs could not be read. It may be corrupted or unsupported."
  ) {
    return "The selected PDF could not be read. It may be corrupted or unsupported.";
  }

  return message;
}

function parseCustomRanges(input: string, pageCount: number): PageRange[] {
  if (input.trim() === "") {
    throw new Error("Enter at least one page range.");
  }

  const ranges = input
    .split(/[\n,]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map(parseRangeToken);
  const validation = validatePageRanges(ranges);

  if (!validation.valid) {
    throw new Error(validation.errors.join(" "));
  }

  const largestReferencedPage = Math.max(
    ...ranges.map((range) => Math.max(range.start, range.end)),
  );

  if (largestReferencedPage > pageCount) {
    throw new Error(
      `Page range exceeds document length. This PDF contains ${pageCount} page${
        pageCount === 1 ? "" : "s"
      }, but the range includes page ${largestReferencedPage}.`,
    );
  }

  return ranges;
}

function parseRangeToken(token: string): PageRange {
  const match = /^(\d+)(?:\s*-\s*(\d+))?$/.exec(token);

  if (match === null) {
    throw new Error(
      "Use page ranges like 1-3, 4, or 5-8, separated by commas or new lines.",
    );
  }

  const start = Number(match[1]);
  const end = match[2] === undefined ? start : Number(match[2]);

  return { start, end };
}
