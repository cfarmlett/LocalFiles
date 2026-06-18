import { describe, expect, it, vi } from "vitest";

import { PdfProcessingError, type PdfAdapter } from "@localdocs/pdf";

import {
  buildMetadataRemovalFileItem,
  createMetadataRemovedFilename,
  getMetadataDisplayFields,
  getMetadataRemovalErrorMessage,
  removeMetadataFromFile,
  type MetadataRemovalFileItem,
} from "./metadataRemovalWorkflow";

function createFile(name: string, type = "application/pdf") {
  return new File(["%PDF- test"], name, { type });
}

function createItem(): MetadataRemovalFileItem {
  return {
    id: "sample",
    file: createFile("sample.pdf"),
    bytes: new Uint8Array([1, 2, 3]),
    metadata: {
      pageCount: 2,
      title: "Quarterly Plan",
      author: "LocalDocs",
      keywords: "private local",
    },
  };
}

function createAdapter(): PdfAdapter {
  return {
    name: "test-adapter",
    readMetadata: vi.fn(async () => ({
      pageCount: 2,
      title: "Quarterly Plan",
      author: "LocalDocs",
    })),
    split: vi.fn(),
    merge: vi.fn(),
    reorder: vi.fn(),
    rotate: vi.fn(),
    deletePages: vi.fn(),
    removeMetadata: vi.fn(async () => new Uint8Array([9, 8, 7])),
  };
}

describe("getMetadataDisplayFields", () => {
  it("extracts present metadata fields", () => {
    expect(
      getMetadataDisplayFields({
        pageCount: 1,
        title: "Title",
        author: "Author",
        subject: "Subject",
        keywords: "alpha beta",
        creator: "Creator",
        producer: "Producer",
        createdAt: new Date("2025-01-02T03:04:05.000Z"),
        modifiedAt: new Date("2025-02-03T04:05:06.000Z"),
      }),
    ).toEqual([
      { label: "Title", value: "Title" },
      { label: "Author", value: "Author" },
      { label: "Subject", value: "Subject" },
      { label: "Keywords", value: "alpha beta" },
      { label: "Creator", value: "Creator" },
      { label: "Producer", value: "Producer" },
      { label: "Creation Date", value: "2025-01-02T03:04:05.000Z" },
      { label: "Modification Date", value: "2025-02-03T04:05:06.000Z" },
    ]);
  });

  it("returns no fields for documents without removable metadata", () => {
    expect(getMetadataDisplayFields({ pageCount: 1 })).toEqual([]);
  });
});

describe("buildMetadataRemovalFileItem", () => {
  it("reads metadata through the adapter", async () => {
    const adapter = createAdapter();
    const item = await buildMetadataRemovalFileItem(
      createFile("sample.pdf"),
      adapter,
      () => "sample",
    );

    expect(item.id).toBe("sample");
    expect(item.metadata.title).toBe("Quarterly Plan");
    expect(adapter.readMetadata).toHaveBeenCalledOnce();
  });
});

describe("removeMetadataFromFile", () => {
  it("calls the adapter and maps the output name", async () => {
    const adapter = createAdapter();
    const result = await removeMetadataFromFile(createItem(), adapter);

    expect(result.filename).toBe("sample-metadata-removed.pdf");
    expect(result.bytes).toEqual(new Uint8Array([9, 8, 7]));
    expect(adapter.removeMetadata).toHaveBeenCalledWith({
      document: createItem().bytes,
    });
  });

  it("maps adapter errors to safe user-facing messages", () => {
    expect(
      getMetadataRemovalErrorMessage(
        new PdfProcessingError("encrypted-document", "internal encrypted"),
      ),
    ).toBe("Password-protected PDFs are not supported yet.");
  });
});

describe("createMetadataRemovedFilename", () => {
  it("generates deterministic user-friendly output names", () => {
    expect(createMetadataRemovedFilename("original.pdf")).toBe(
      "original-metadata-removed.pdf",
    );
    expect(createMetadataRemovedFilename("Document.PDF")).toBe(
      "Document-metadata-removed.pdf",
    );
    expect(createMetadataRemovedFilename("")).toBe(
      "document-metadata-removed.pdf",
    );
  });

  it("does not stack the metadata-removed suffix", () => {
    expect(createMetadataRemovedFilename("budget_receipt.pdf")).toBe(
      "budget_receipt-metadata-removed.pdf",
    );
    expect(
      createMetadataRemovedFilename("budget_receipt-metadata-removed.pdf"),
    ).toBe("budget_receipt-metadata-removed.pdf");
    expect(createMetadataRemovedFilename("Document-METADATA-REMOVED.PDF")).toBe(
      "Document-metadata-removed.pdf",
    );
  });
});
