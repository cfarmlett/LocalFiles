import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "@localfiles/pdf";

import { getPdfErrorMessage, validatePdfFile } from "./mergeWorkflow";

export type PageListItem = Readonly<{
  id: string;
  pageNumber: number;
}>;

export type ReorderFileItem = Readonly<{
  id: string;
  file: File;
  bytes: Uint8Array;
  metadata: PdfDocumentMetadata;
}>;

export type ReorderResult = Readonly<{
  bytes: Uint8Array;
  filename: string;
}>;

export async function buildReorderFileItem(
  file: File,
  adapter: PdfAdapter,
  createId: () => string,
): Promise<ReorderFileItem> {
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

export function createDefaultPageOrder(pageCount: number): PageListItem[] {
  if (!Number.isInteger(pageCount) || pageCount < 1) {
    throw new Error("Select a readable PDF before reordering pages.");
  }

  return Array.from({ length: pageCount }, (_, index) => {
    const pageNumber = index + 1;

    return {
      id: `page-${pageNumber}`,
      pageNumber,
    };
  });
}

export function movePage(
  pages: readonly PageListItem[],
  pageId: string,
  direction: "up" | "down",
): PageListItem[] {
  const index = pages.findIndex((page) => page.id === pageId);

  if (index === -1) {
    return [...pages];
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= pages.length) {
    return [...pages];
  }

  const nextPages = [...pages];
  const current = nextPages[index];
  nextPages[index] = nextPages[targetIndex];
  nextPages[targetIndex] = current;

  return nextPages;
}

export function movePageBefore(
  pages: readonly PageListItem[],
  draggedPageId: string,
  targetPageId: string,
): PageListItem[] {
  if (draggedPageId === targetPageId) {
    return [...pages];
  }

  const draggedIndex = pages.findIndex((page) => page.id === draggedPageId);
  const targetIndex = pages.findIndex((page) => page.id === targetPageId);

  if (draggedIndex === -1 || targetIndex === -1) {
    return [...pages];
  }

  const nextPages = [...pages];
  const [draggedPage] = nextPages.splice(draggedIndex, 1);
  const insertionIndex = nextPages.findIndex(
    (page) => page.id === targetPageId,
  );

  nextPages.splice(insertionIndex, 0, draggedPage);

  return nextPages;
}

export function validatePageOrder(
  pages: readonly PageListItem[],
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

export async function reorderFile(
  file: ReorderFileItem,
  adapter: PdfAdapter,
  pages: readonly PageListItem[],
): Promise<ReorderResult> {
  if (!validatePageOrder(pages, file.metadata.pageCount)) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "Page order must include every page exactly once.",
    );
  }

  const bytes = await adapter.reorder({
    document: file.bytes,
    pageOrder: pages.map((page) => page.pageNumber),
  });

  return {
    bytes,
    filename: createReorderedFilename(file.file.name),
  };
}

export function createReorderedFilename(filename: string): string {
  const trimmed = filename.trim();

  if (trimmed === "") {
    return "reordered-document.pdf";
  }

  const withoutExtension = trimmed.replace(/\.pdf$/i, "");
  const safeBase = withoutExtension.trim() || "document";

  return `${safeBase}-reordered.pdf`;
}

export function getReorderErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message === "Select a readable PDF before reordering pages." ||
      error.message === "Choose one PDF before reordering pages." ||
      error.message === "Page order must include every page exactly once." ||
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
