import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "@localfiles/pdf";

import { getPdfErrorMessage, validatePdfFile } from "./mergeWorkflow";

export type DeletePageItem = Readonly<{
  id: string;
  pageNumber: number;
  deleted: boolean;
}>;

export type DeleteFileItem = Readonly<{
  id: string;
  file: File;
  bytes: Uint8Array;
  metadata: PdfDocumentMetadata;
}>;

export type DeleteResult = Readonly<{
  bytes: Uint8Array;
  filename: string;
}>;

export async function buildDeleteFileItem(
  file: File,
  adapter: PdfAdapter,
  createId: () => string,
): Promise<DeleteFileItem> {
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

export function createDefaultDeletePages(pageCount: number): DeletePageItem[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error("Select a readable PDF before deleting pages.");
  }

  return Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;

    return {
      id: `page-${pageNumber}`,
      pageNumber,
      deleted: false,
    };
  });
}

export function markPageDeleted(
  pages: readonly DeletePageItem[],
  pageId: string,
): DeletePageItem[] {
  return pages.map((page) =>
    page.id === pageId
      ? {
          ...page,
          deleted: true,
        }
      : page,
  );
}

export function restorePage(
  pages: readonly DeletePageItem[],
  pageId: string,
): DeletePageItem[] {
  return pages.map((page) =>
    page.id === pageId
      ? {
          ...page,
          deleted: false,
        }
      : page,
  );
}

export function getRemainingPageNumbers(
  pages: readonly DeletePageItem[],
): number[] {
  return pages.filter((page) => !page.deleted).map((page) => page.pageNumber);
}

export function allPagesDeleted(pages: readonly DeletePageItem[]): boolean {
  return pages.length > 0 && pages.every((page) => page.deleted);
}

export async function deletePagesFile(
  file: DeleteFileItem,
  adapter: PdfAdapter,
  pages: readonly DeletePageItem[],
): Promise<DeleteResult> {
  if (!hasValidDeletePages(pages, file.metadata.pageCount)) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "Page deletion state must include every page exactly once.",
    );
  }

  if (allPagesDeleted(pages)) {
    throw new Error("Restore at least one page before generating a PDF.");
  }

  const pageNumbers = pages
    .filter((page) => page.deleted)
    .map((page) => page.pageNumber);

  if (pageNumbers.length === 0) {
    throw new Error("Mark at least one page for deletion before generating.");
  }

  const bytes = await adapter.deletePages({
    document: file.bytes,
    pageNumbers,
  });

  return {
    bytes,
    filename: createPagesDeletedFilename(file.file.name),
  };
}

export function createPagesDeletedFilename(filename: string): string {
  const trimmed = filename.trim();

  if (trimmed === "") {
    return "document-pages-deleted.pdf";
  }

  const withoutExtension = trimmed.replace(/\.pdf$/i, "");
  const safeBase = withoutExtension.trim() || "document";

  return `${safeBase}-pages-deleted.pdf`;
}

export function getDeleteErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message === "Select a readable PDF before deleting pages." ||
      error.message === "Choose one PDF before deleting pages." ||
      error.message === "Restore at least one page before generating a PDF." ||
      error.message ===
        "Mark at least one page for deletion before generating." ||
      error.message ===
        "Page deletion state must include every page exactly once." ||
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

function hasValidDeletePages(
  pages: readonly DeletePageItem[],
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
      seen.has(page.pageNumber)
    ) {
      return false;
    }

    seen.add(page.pageNumber);
  }

  return seen.size === pageCount;
}
