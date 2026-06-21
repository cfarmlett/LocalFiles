import {
  PdfProcessingError,
  type PdfAdapter,
  type PdfDocumentMetadata,
} from "@localfiles/pdf";

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

function splitNaturalFilename(filename: string): string[] {
  return filename.match(/\d+|\D+/g) ?? [];
}

function compareNumericSegments(left: string, right: string): number {
  const normalizedLeft = left.replace(/^0+/, "") || "0";
  const normalizedRight = right.replace(/^0+/, "") || "0";

  if (normalizedLeft.length !== normalizedRight.length) {
    return normalizedLeft.length < normalizedRight.length ? -1 : 1;
  }

  if (normalizedLeft === normalizedRight) {
    return 0;
  }

  return normalizedLeft < normalizedRight ? -1 : 1;
}

export function compareNaturalFilenames(left: string, right: string): number {
  const leftSegments = splitNaturalFilename(left);
  const rightSegments = splitNaturalFilename(right);
  const sharedLength = Math.min(leftSegments.length, rightSegments.length);

  for (let index = 0; index < sharedLength; index += 1) {
    const leftSegment = leftSegments[index];
    const rightSegment = rightSegments[index];
    const leftIsNumeric = /^\d+$/.test(leftSegment);
    const rightIsNumeric = /^\d+$/.test(rightSegment);

    if (leftIsNumeric && rightIsNumeric) {
      const comparison = compareNumericSegments(leftSegment, rightSegment);

      if (comparison !== 0) {
        return comparison;
      }

      continue;
    }

    if (leftIsNumeric !== rightIsNumeric) {
      return leftIsNumeric ? -1 : 1;
    }

    const normalizedLeft = leftSegment.toLowerCase();
    const normalizedRight = rightSegment.toLowerCase();

    if (normalizedLeft !== normalizedRight) {
      return normalizedLeft < normalizedRight ? -1 : 1;
    }
  }

  if (leftSegments.length === rightSegments.length) {
    return 0;
  }

  return leftSegments.length < rightSegments.length ? -1 : 1;
}

export function sortFilesByNaturalFilename<T extends { readonly name: string }>(
  files: readonly T[],
): T[] {
  return files
    .map((file, originalIndex) => ({ file, originalIndex }))
    .sort(
      (left, right) =>
        compareNaturalFilenames(left.file.name, right.file.name) ||
        left.originalIndex - right.originalIndex,
    )
    .map(({ file }) => file);
}

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
    filename: "localfiles-merged.pdf",
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
