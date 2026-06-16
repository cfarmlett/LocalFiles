import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "@localdocs/pdf";

export type MergeFileStatus = "ready" | "reading" | "error";

export type MergeFileItem = Readonly<{
  id: string;
  file: File;
  bytes: Uint8Array;
  metadata?: PdfDocumentMetadata;
  status: MergeFileStatus;
  error?: string;
}>;

export type MergeResult = Readonly<{
  bytes: Uint8Array;
  filename: string;
}>;

export type FileValidationResult =
  | Readonly<{
      valid: true;
    }>
  | Readonly<{
      valid: false;
      message: string;
    }>;

export function validatePdfFile(file: File): FileValidationResult {
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");
  // Some browsers and operating systems leave File.type empty for local PDFs.
  const hasPdfType = file.type === "" || file.type === "application/pdf";

  if (!hasPdfExtension || !hasPdfType) {
    return {
      valid: false,
      message: `${file.name} is not a PDF file.`,
    };
  }

  return { valid: true };
}

export function moveMergeFile(
  files: readonly MergeFileItem[],
  fileId: string,
  direction: "up" | "down",
): MergeFileItem[] {
  const index = files.findIndex((file) => file.id === fileId);

  if (index === -1) {
    return [...files];
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;

  if (targetIndex < 0 || targetIndex >= files.length) {
    return [...files];
  }

  const nextFiles = [...files];
  const current = nextFiles[index];
  nextFiles[index] = nextFiles[targetIndex];
  nextFiles[targetIndex] = current;

  return nextFiles;
}

export function removeMergeFile(
  files: readonly MergeFileItem[],
  fileId: string,
): MergeFileItem[] {
  return files.filter((file) => file.id !== fileId);
}

export async function buildMergeFileItem(
  file: File,
  adapter: PdfAdapter,
  createId: () => string,
): Promise<MergeFileItem> {
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
    status: "ready",
  };
}

export async function mergeFiles(
  files: readonly MergeFileItem[],
  adapter: PdfAdapter,
): Promise<MergeResult> {
  if (files.length === 0) {
    throw new Error("Add at least one PDF before merging.");
  }

  const bytes = await adapter.merge({
    documents: files.map((file) => file.bytes),
  });

  return {
    bytes,
    filename: "localdocs-merged.pdf",
  };
}

export function getPdfErrorMessage(error: unknown): string {
  if (error instanceof PdfProcessingError) {
    if (error.code === "encrypted-document") {
      return "Password-protected PDFs are not supported yet.";
    }

    if (error.code === "invalid-document") {
      return "One of the selected PDFs could not be read. It may be corrupted or unsupported.";
    }

    return error.message;
  }

  if (error instanceof Error) {
    if (
      error.message === "Add at least one PDF before merging." ||
      error.message.endsWith(" is not a PDF file.")
    ) {
      return error.message;
    }
  }

  return "The PDF operation failed. Try again with different PDF files.";
}
