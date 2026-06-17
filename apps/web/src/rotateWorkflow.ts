import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "@localdocs/pdf";

import { getPdfErrorMessage, validatePdfFile } from "./mergeWorkflow";

export type RotatePageItem = Readonly<{
  id: string;
  pageNumber: number;
  rotation: number;
}>;

export type RotateFileItem = Readonly<{
  id: string;
  file: File;
  bytes: Uint8Array;
  metadata: PdfDocumentMetadata;
}>;

export type RotateResult = Readonly<{
  bytes: Uint8Array;
  filename: string;
}>;

export async function buildRotateFileItem(
  file: File,
  adapter: PdfAdapter,
  createId: () => string,
): Promise<RotateFileItem> {
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

export function createDefaultRotatePages(
  pageCount: number,
  pageRotations: readonly number[] = [],
): RotatePageItem[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error("Select a readable PDF before rotating pages.");
  }

  return Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;

    return {
      id: `page-${pageNumber}`,
      pageNumber,
      rotation: normalizeRotation(pageRotations[index] ?? 0),
    };
  });
}

export function rotatePage(
  pages: readonly RotatePageItem[],
  pageId: string,
  direction: "left" | "right",
): RotatePageItem[] {
  const delta = direction === "left" ? -90 : 90;

  return pages.map((page) =>
    page.id === pageId
      ? {
          ...page,
          rotation: normalizeRotation(page.rotation + delta),
        }
      : page,
  );
}

export function normalizeRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

export async function rotateFile(
  file: RotateFileItem,
  adapter: PdfAdapter,
  pages: readonly RotatePageItem[],
): Promise<RotateResult> {
  if (!hasValidRotatePages(pages, file.metadata.pageCount)) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "Page rotations must include every page exactly once.",
    );
  }

  const bytes = await adapter.rotate({
    document: file.bytes,
    rotations: pages.map((page) => ({
      pageNumber: page.pageNumber,
      rotation: page.rotation,
    })),
  });

  return {
    bytes,
    filename: createRotatedFilename(file.file.name),
  };
}

export function createRotatedFilename(filename: string): string {
  const trimmed = filename.trim();

  if (trimmed === "") {
    return "rotated-document.pdf";
  }

  const withoutExtension = trimmed.replace(/\.pdf$/i, "");
  const safeBase = withoutExtension.trim() || "document";

  return `${safeBase}-rotated.pdf`;
}

export function getRotateErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message === "Select a readable PDF before rotating pages." ||
      error.message === "Choose one PDF before rotating pages." ||
      error.message ===
        "Page rotations must include every page exactly once." ||
      error.message.endsWith(" is not a PDF file.")
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

function hasValidRotatePages(
  pages: readonly RotatePageItem[],
  pageCount: number,
): boolean {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    return false;
  }

  if (pages.length !== pageCount) {
    return false;
  }

  const seen = new Set<number>();

  for (const page of pages) {
    if (
      !Number.isInteger(page.pageNumber) ||
      page.pageNumber < 1 ||
      page.pageNumber > pageCount ||
      !isNormalizedRotation(page.rotation) ||
      seen.has(page.pageNumber)
    ) {
      return false;
    }

    seen.add(page.pageNumber);
  }

  return seen.size === pageCount;
}

function isNormalizedRotation(rotation: number): boolean {
  return (
    rotation === 0 || rotation === 90 || rotation === 180 || rotation === 270
  );
}
