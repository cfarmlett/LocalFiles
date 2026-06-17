import { type PdfAdapter, type PdfDocumentMetadata } from "@localdocs/pdf";

import { getPdfErrorMessage, validatePdfFile } from "./mergeWorkflow";

export type MetadataRemovalFileItem = Readonly<{
  id: string;
  file: File;
  bytes: Uint8Array;
  metadata: PdfDocumentMetadata;
}>;

export type MetadataRemovalResult = Readonly<{
  bytes: Uint8Array;
  filename: string;
}>;

export type MetadataDisplayField = Readonly<{
  label: string;
  value: string;
}>;

export async function buildMetadataRemovalFileItem(
  file: File,
  adapter: PdfAdapter,
  createId: () => string,
): Promise<MetadataRemovalFileItem> {
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

export function getMetadataDisplayFields(
  metadata: PdfDocumentMetadata,
): MetadataDisplayField[] {
  return [
    textField("Title", metadata.title),
    textField("Author", metadata.author),
    textField("Subject", metadata.subject),
    textField("Keywords", metadata.keywords),
    textField("Creator", metadata.creator),
    textField("Producer", metadata.producer),
    dateField("Creation Date", metadata.createdAt),
    dateField("Modification Date", metadata.modifiedAt),
  ].filter((field): field is MetadataDisplayField => field !== undefined);
}

export async function removeMetadataFromFile(
  file: MetadataRemovalFileItem,
  adapter: PdfAdapter,
): Promise<MetadataRemovalResult> {
  const bytes = await adapter.removeMetadata({
    document: file.bytes,
  });

  return {
    bytes,
    filename: createMetadataRemovedFilename(file.file.name),
  };
}

export function createMetadataRemovedFilename(filename: string): string {
  const trimmed = filename.trim();

  if (trimmed === "") {
    return "document-metadata-removed.pdf";
  }

  const withoutExtension = trimmed.replace(/\.pdf$/i, "");
  const safeBase = withoutExtension.trim() || "document";

  return `${safeBase}-metadata-removed.pdf`;
}

export function getMetadataRemovalErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message === "Choose one PDF before removing metadata." ||
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

function textField(
  label: string,
  value: string | undefined,
): MetadataDisplayField | undefined {
  if (value === undefined || value.trim() === "") {
    return undefined;
  }

  return {
    label,
    value,
  };
}

function dateField(
  label: string,
  value: Date | undefined,
): MetadataDisplayField | undefined {
  if (value === undefined) {
    return undefined;
  }

  return {
    label,
    value: value.toISOString(),
  };
}
