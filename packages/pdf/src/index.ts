import { PDFDocument } from "pdf-lib";

export type PdfDocumentMetadata = Readonly<{
  pageCount: number;
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

export interface PdfAdapter {
  readonly name: string;

  readMetadata(document: Uint8Array): Promise<PdfDocumentMetadata>;
  split(request: PdfSplitRequest): Promise<readonly Uint8Array[]>;
  merge(request: PdfMergeRequest): Promise<Uint8Array>;
}

export class LocalPdfAdapter implements PdfAdapter {
  readonly name = "local-pdf-lib-adapter";

  async readMetadata(document: Uint8Array): Promise<PdfDocumentMetadata> {
    assertDocumentBytes(document);
    const pdfDocument = await loadPdfDocument(document);

    return {
      pageCount: pdfDocument.getPageCount(),
      title: pdfDocument.getTitle() ?? undefined,
      author: pdfDocument.getAuthor() ?? undefined,
      subject: pdfDocument.getSubject() ?? undefined,
      creator: pdfDocument.getCreator() ?? undefined,
      producer: pdfDocument.getProducer() ?? undefined,
      createdAt: pdfDocument.getCreationDate() ?? undefined,
      modifiedAt: pdfDocument.getModificationDate() ?? undefined,
    };
  }

  async split(_request: PdfSplitRequest): Promise<readonly Uint8Array[]> {
    throw new PdfProcessingError(
      "unsupported-operation",
      "Splitting PDFs is not implemented yet.",
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
