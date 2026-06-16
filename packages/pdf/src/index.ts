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

export class StubLocalPdfAdapter implements PdfAdapter {
  readonly name = "stub-local-pdf-adapter";

  async readMetadata(document: Uint8Array): Promise<PdfDocumentMetadata> {
    this.assertDocumentBytes(document);
    throw this.unsupported("Reading PDF metadata is not implemented yet.");
  }

  async split(request: PdfSplitRequest): Promise<readonly Uint8Array[]> {
    this.assertDocumentBytes(request.document);
    this.assertPageRanges(request.ranges);
    throw this.unsupported("Splitting PDFs is not implemented yet.");
  }

  async merge(request: PdfMergeRequest): Promise<Uint8Array> {
    if (!Array.isArray(request.documents) || request.documents.length === 0) {
      throw new PdfProcessingError(
        "invalid-document",
        "At least one PDF document is required.",
      );
    }

    request.documents.forEach((document) => this.assertDocumentBytes(document));
    throw this.unsupported("Merging PDFs is not implemented yet.");
  }

  private assertDocumentBytes(document: Uint8Array): void {
    if (!(document instanceof Uint8Array) || document.byteLength === 0) {
      throw new PdfProcessingError(
        "invalid-document",
        "PDF document bytes must be a non-empty Uint8Array.",
      );
    }
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
