import { PDFDocument, degrees } from "pdf-lib";

export type PdfDocumentMetadata = Readonly<{
  pageCount: number;
  pageRotations?: readonly number[];
  title?: string;
  author?: string;
  subject?: string;
  creator?: string;
  producer?: string;
  createdAt?: Date;
  modifiedAt?: Date;
}>;

export type PdfProcessingErrorCode =
  | "unsupported-operation"
  | "invalid-document"
  | "encrypted-document"
  | "invalid-page-range"
  | "processing-failed";

export class PdfProcessingError extends Error {
  readonly code: PdfProcessingErrorCode;

  constructor(code: PdfProcessingErrorCode, message: string) {
    super(message);
    this.name = "PdfProcessingError";
    this.code = code;
  }
}

export type PdfPageRange = Readonly<{
  start: number;
  end: number;
}>;

export type PdfSplitRequest = Readonly<{
  document: Uint8Array;
  ranges: readonly PdfPageRange[];
}>;

export type PdfMergeRequest = Readonly<{
  documents: readonly Uint8Array[];
}>;

export type PdfReorderRequest = Readonly<{
  document: Uint8Array;
  pageOrder: readonly number[];
}>;

export type PdfPageRotation = Readonly<{
  pageNumber: number;
  rotation: number;
}>;

export type PdfRotateRequest = Readonly<{
  document: Uint8Array;
  rotations: readonly PdfPageRotation[];
}>;

export type PdfDeletePagesRequest = Readonly<{
  document: Uint8Array;
  pageNumbers: readonly number[];
}>;

export interface PdfAdapter {
  readonly name: string;

  readMetadata(document: Uint8Array): Promise<PdfDocumentMetadata>;
  split(request: PdfSplitRequest): Promise<readonly Uint8Array[]>;
  merge(request: PdfMergeRequest): Promise<Uint8Array>;
  reorder(request: PdfReorderRequest): Promise<Uint8Array>;
  rotate(request: PdfRotateRequest): Promise<Uint8Array>;
  deletePages(request: PdfDeletePagesRequest): Promise<Uint8Array>;
}

export class LocalPdfAdapter implements PdfAdapter {
  readonly name = "local-pdf-lib-adapter";

  async readMetadata(document: Uint8Array): Promise<PdfDocumentMetadata> {
    assertDocumentBytes(document);
    const pdfDocument = await loadPdfDocument(document);

    return {
      pageCount: pdfDocument.getPageCount(),
      pageRotations: pdfDocument
        .getPages()
        .map((page) => normalizeRotation(page.getRotation().angle)),
      title: pdfDocument.getTitle() ?? undefined,
      author: pdfDocument.getAuthor() ?? undefined,
      subject: pdfDocument.getSubject() ?? undefined,
      creator: pdfDocument.getCreator() ?? undefined,
      producer: pdfDocument.getProducer() ?? undefined,
      createdAt: pdfDocument.getCreationDate() ?? undefined,
      modifiedAt: pdfDocument.getModificationDate() ?? undefined,
    };
  }

  async split(request: PdfSplitRequest): Promise<readonly Uint8Array[]> {
    assertSplitRequest(request);
    assertDocumentBytes(request.document);
    assertPageRanges(request.ranges);

    const sourceDocument = await loadPdfDocument(request.document);
    const pageCount = sourceDocument.getPageCount();

    return Promise.all(
      request.ranges.map(async (range) => {
        if (range.end > pageCount) {
          throw new PdfProcessingError(
            "invalid-page-range",
            `Page range end must be less than or equal to page count (${pageCount}).`,
          );
        }

        const splitDocument = await PDFDocument.create();
        const pageIndexes = rangeToPageIndexes(range);
        const copiedPages = await splitDocument.copyPages(
          sourceDocument,
          pageIndexes,
        );

        copiedPages.forEach((page) => splitDocument.addPage(page));

        return splitDocument.save();
      }),
    );
  }

  async merge(request: PdfMergeRequest): Promise<Uint8Array> {
    assertMergeRequest(request);

    const mergedDocument = await PDFDocument.create();

    for (const document of request.documents) {
      assertDocumentBytes(document);
      const sourceDocument = await loadPdfDocument(document);
      const pageIndexes = sourceDocument.getPageIndices();
      const copiedPages = await mergedDocument.copyPages(
        sourceDocument,
        pageIndexes,
      );

      copiedPages.forEach((page) => mergedDocument.addPage(page));
    }

    return mergedDocument.save();
  }

  async reorder(request: PdfReorderRequest): Promise<Uint8Array> {
    assertReorderRequest(request);
    assertDocumentBytes(request.document);

    const sourceDocument = await loadPdfDocument(request.document);
    const pageCount = sourceDocument.getPageCount();
    assertPageOrder(request.pageOrder, pageCount);

    const reorderedDocument = await PDFDocument.create();
    const copiedPages = await reorderedDocument.copyPages(
      sourceDocument,
      request.pageOrder.map((pageNumber) => pageNumber - 1),
    );

    copiedPages.forEach((page) => reorderedDocument.addPage(page));

    return reorderedDocument.save();
  }

  async rotate(request: PdfRotateRequest): Promise<Uint8Array> {
    assertRotateRequest(request);
    assertDocumentBytes(request.document);

    const pdfDocument = await loadPdfDocument(request.document);
    assertPageRotations(request.rotations, pdfDocument.getPageCount());

    request.rotations.forEach((rotation) => {
      pdfDocument
        .getPage(rotation.pageNumber - 1)
        .setRotation(degrees(normalizeRotation(rotation.rotation)));
    });

    return pdfDocument.save();
  }

  async deletePages(request: PdfDeletePagesRequest): Promise<Uint8Array> {
    assertDeletePagesRequest(request);
    assertDocumentBytes(request.document);

    const sourceDocument = await loadPdfDocument(request.document);
    const pageCount = sourceDocument.getPageCount();
    assertPagesToDelete(request.pageNumbers, pageCount);

    const pagesToDelete = new Set(request.pageNumbers);
    const keptPageIndexes = sourceDocument
      .getPageIndices()
      .filter((pageIndex) => !pagesToDelete.has(pageIndex + 1));
    const outputDocument = await PDFDocument.create();
    const copiedPages = await outputDocument.copyPages(
      sourceDocument,
      keptPageIndexes,
    );

    copiedPages.forEach((page) => outputDocument.addPage(page));

    return outputDocument.save();
  }
}

export class StubLocalPdfAdapter implements PdfAdapter {
  readonly name = "stub-local-pdf-adapter";

  async readMetadata(document: Uint8Array): Promise<PdfDocumentMetadata> {
    this.assertDocumentBytes(document);
    throw this.unsupported("Reading PDF metadata is not implemented yet.");
  }

  async split(request: PdfSplitRequest): Promise<readonly Uint8Array[]> {
    this.assertSplitRequest(request);
    this.assertDocumentBytes(request.document);
    this.assertPageRanges(request.ranges);
    throw this.unsupported("Splitting PDFs is not implemented yet.");
  }

  async merge(request: PdfMergeRequest): Promise<Uint8Array> {
    assertMergeRequest(request);
    request.documents.forEach((document) => assertDocumentBytes(document));
    throw this.unsupported("Merging PDFs is not implemented yet.");
  }

  async reorder(request: PdfReorderRequest): Promise<Uint8Array> {
    assertReorderRequest(request);
    assertDocumentBytes(request.document);
    throw this.unsupported("Reordering PDF pages is not implemented yet.");
  }

  async rotate(request: PdfRotateRequest): Promise<Uint8Array> {
    assertRotateRequest(request);
    assertDocumentBytes(request.document);
    throw this.unsupported("Rotating PDF pages is not implemented yet.");
  }

  async deletePages(request: PdfDeletePagesRequest): Promise<Uint8Array> {
    assertDeletePagesRequest(request);
    assertDocumentBytes(request.document);
    throw this.unsupported("Deleting PDF pages is not implemented yet.");
  }

  private assertSplitRequest(request: PdfSplitRequest): void {
    if (!isRecord(request)) {
      throw new PdfProcessingError(
        "invalid-document",
        "PDF split request must be an object.",
      );
    }
  }

  private assertDocumentBytes(document: Uint8Array): void {
    assertDocumentBytes(document);
  }

  private assertPageRanges(ranges: readonly PdfPageRange[]): void {
    if (!Array.isArray(ranges) || ranges.length === 0) {
      throw new PdfProcessingError(
        "invalid-page-range",
        "At least one page range is required.",
      );
    }

    for (const range of ranges) {
      if (
        !Number.isInteger(range.start) ||
        !Number.isInteger(range.end) ||
        range.start < 1 ||
        range.end < range.start
      ) {
        throw new PdfProcessingError(
          "invalid-page-range",
          "Page ranges must use positive one-based start and end values.",
        );
      }
    }
  }

  private unsupported(message: string): PdfProcessingError {
    return new PdfProcessingError("unsupported-operation", message);
  }
}

function assertMergeRequest(request: PdfMergeRequest): void {
  if (!isRecord(request)) {
    throw new PdfProcessingError(
      "invalid-document",
      "PDF merge request must be an object.",
    );
  }

  if (!Array.isArray(request.documents) || request.documents.length === 0) {
    throw new PdfProcessingError(
      "invalid-document",
      "At least one PDF document is required.",
    );
  }
}

function assertReorderRequest(request: PdfReorderRequest): void {
  if (!isRecord(request)) {
    throw new PdfProcessingError(
      "invalid-document",
      "PDF reorder request must be an object.",
    );
  }
}

function assertRotateRequest(request: PdfRotateRequest): void {
  if (!isRecord(request)) {
    throw new PdfProcessingError(
      "invalid-document",
      "PDF rotate request must be an object.",
    );
  }
}

function assertDeletePagesRequest(request: PdfDeletePagesRequest): void {
  if (!isRecord(request)) {
    throw new PdfProcessingError(
      "invalid-document",
      "PDF delete pages request must be an object.",
    );
  }
}

function assertPagesToDelete(
  pageNumbers: readonly number[],
  pageCount: number,
): void {
  if (!Array.isArray(pageNumbers) || pageNumbers.length === 0) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "At least one page must be selected for deletion.",
    );
  }

  const seen = new Set<number>();

  for (const pageNumber of pageNumbers) {
    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      pageNumber > pageCount ||
      seen.has(pageNumber)
    ) {
      throw new PdfProcessingError(
        "invalid-page-range",
        "Pages selected for deletion must be unique valid page numbers.",
      );
    }

    seen.add(pageNumber);
  }

  if (seen.size >= pageCount) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "At least one page must remain in the output PDF.",
    );
  }
}

function assertPageRotations(
  rotations: readonly PdfPageRotation[],
  pageCount: number,
): void {
  if (!Array.isArray(rotations)) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "Page rotations must be an array.",
    );
  }

  const seen = new Set<number>();

  for (const rotation of rotations) {
    const pageNumber = isRecord(rotation) ? rotation.pageNumber : undefined;
    const degreesValue = isRecord(rotation) ? rotation.rotation : undefined;

    if (
      typeof pageNumber !== "number" ||
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      pageNumber > pageCount ||
      typeof degreesValue !== "number" ||
      !Number.isInteger(degreesValue) ||
      !isQuarterTurnRotation(degreesValue) ||
      seen.has(pageNumber)
    ) {
      throw new PdfProcessingError(
        "invalid-page-range",
        "Page rotations must use unique page numbers and quarter-turn rotations.",
      );
    }

    seen.add(pageNumber);
  }
}

function assertPageOrder(
  pageOrder: readonly number[],
  pageCount: number,
): void {
  if (!Array.isArray(pageOrder) || pageOrder.length !== pageCount) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "Page order must include every page exactly once.",
    );
  }

  const seen = new Set<number>();

  for (const pageNumber of pageOrder) {
    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      pageNumber > pageCount ||
      seen.has(pageNumber)
    ) {
      throw new PdfProcessingError(
        "invalid-page-range",
        "Page order must include every page exactly once.",
      );
    }

    seen.add(pageNumber);
  }
}

function normalizeRotation(rotation: number): number {
  return ((rotation % 360) + 360) % 360;
}

function isQuarterTurnRotation(rotation: number): boolean {
  return rotation % 90 === 0;
}

function assertSplitRequest(request: PdfSplitRequest): void {
  if (!isRecord(request)) {
    throw new PdfProcessingError(
      "invalid-document",
      "PDF split request must be an object.",
    );
  }
}

function assertPageRanges(ranges: readonly PdfPageRange[]): void {
  if (!Array.isArray(ranges) || ranges.length === 0) {
    throw new PdfProcessingError(
      "invalid-page-range",
      "At least one page range is required.",
    );
  }

  for (const range of ranges) {
    const start = isRecord(range) ? range.start : undefined;
    const end = isRecord(range) ? range.end : undefined;

    if (
      typeof start !== "number" ||
      typeof end !== "number" ||
      !Number.isInteger(start) ||
      !Number.isInteger(end) ||
      start < 1 ||
      end < start
    ) {
      throw new PdfProcessingError(
        "invalid-page-range",
        "Page ranges must use positive one-based start and end values.",
      );
    }
  }
}

function rangeToPageIndexes(range: PdfPageRange): number[] {
  return Array.from(
    { length: range.end - range.start + 1 },
    (_, index) => range.start - 1 + index,
  );
}

function assertDocumentBytes(document: Uint8Array): void {
  if (!(document instanceof Uint8Array) || document.byteLength === 0) {
    throw new PdfProcessingError(
      "invalid-document",
      "PDF document bytes must be a non-empty Uint8Array.",
    );
  }

  if (!hasPdfHeader(document)) {
    throw new PdfProcessingError(
      "invalid-document",
      "Only PDF files can be processed.",
    );
  }
}

async function loadPdfDocument(document: Uint8Array): Promise<PDFDocument> {
  try {
    return await PDFDocument.load(document, {
      ignoreEncryption: false,
    });
  } catch (error) {
    if (isLikelyEncryptedPdfError(error)) {
      throw new PdfProcessingError(
        "encrypted-document",
        "Password-protected or encrypted PDFs are not supported yet.",
      );
    }

    throw new PdfProcessingError(
      "invalid-document",
      "The PDF could not be read. It may be corrupted or unsupported.",
    );
  }
}

function isLikelyEncryptedPdfError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return /encrypt|password/i.test(`${error.name} ${error.message}`);
}

function hasPdfHeader(document: Uint8Array): boolean {
  const maxOffset = Math.min(document.length - 5, 1024);

  for (let offset = 0; offset <= maxOffset; offset += 1) {
    if (
      document[offset] === 0x25 &&
      document[offset + 1] === 0x50 &&
      document[offset + 2] === 0x44 &&
      document[offset + 3] === 0x46 &&
      document[offset + 4] === 0x2d
    ) {
      return true;
    }
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
