import { describe, expect, it, vi } from "vitest";

import { PdfProcessingError, type PdfAdapter } from "@localdocs/pdf";

import {
  buildRotateFileItem,
  createDefaultRotatePages,
  createRotatedFilename,
  getRotateErrorMessage,
  normalizeRotation,
  rotateFile,
  rotatePage,
  type RotateFileItem,
} from "./rotateWorkflow";

function createFile(name: string, type = "application/pdf") {
  return new File(["%PDF- test"], name, { type });
}

function createItem(): RotateFileItem {
  return {
    id: "sample",
    file: createFile("sample.pdf"),
    bytes: new Uint8Array([1, 2, 3]),
    metadata: { pageCount: 2, pageRotations: [0, 90] },
  };
}

function createAdapter(): PdfAdapter {
  return {
    name: "test-adapter",
    readMetadata: vi.fn(async () => ({ pageCount: 2, pageRotations: [0, 90] })),
    split: vi.fn(),
    merge: vi.fn(),
    reorder: vi.fn(),
    rotate: vi.fn(async () => new Uint8Array([9, 8, 7])),
    deletePages: vi.fn(),
    removeMetadata: vi.fn(),
  };
}

describe("createDefaultRotatePages", () => {
  it("creates one-based page rows with existing rotations", () => {
    expect(createDefaultRotatePages(2, [0, 90])).toEqual([
      { id: "page-1", pageNumber: 1, rotation: 0 },
      { id: "page-2", pageNumber: 2, rotation: 90 },
    ]);
  });

  it("defaults missing rotations to 0 degrees", () => {
    expect(createDefaultRotatePages(2)).toEqual([
      { id: "page-1", pageNumber: 1, rotation: 0 },
      { id: "page-2", pageNumber: 2, rotation: 0 },
    ]);
  });
});

describe("rotation controls", () => {
  it("rotates a page right", () => {
    expect(
      rotatePage(createDefaultRotatePages(1), "page-1", "right")[0].rotation,
    ).toBe(90);
  });

  it("rotates a page left", () => {
    expect(
      rotatePage(createDefaultRotatePages(1), "page-1", "left")[0].rotation,
    ).toBe(270);
  });

  it("wraps rotation after full cycles", () => {
    const pages = createDefaultRotatePages(1, [270]);

    expect(rotatePage(pages, "page-1", "right")[0].rotation).toBe(0);
    expect(rotatePage(pages, "page-1", "left")[0].rotation).toBe(180);
  });

  it("applies repeated rotations from existing rotation state", () => {
    const pages = createDefaultRotatePages(1, [90]);
    const rotatedOnce = rotatePage(pages, "page-1", "right");
    const rotatedTwice = rotatePage(rotatedOnce, "page-1", "right");

    expect(rotatedOnce[0].rotation).toBe(180);
    expect(rotatedTwice[0].rotation).toBe(270);
  });

  it("normalizes positive and negative rotations", () => {
    expect(normalizeRotation(450)).toBe(90);
    expect(normalizeRotation(-90)).toBe(270);
  });
});

describe("buildRotateFileItem", () => {
  it("reads metadata through the adapter", async () => {
    const adapter = createAdapter();
    const item = await buildRotateFileItem(
      createFile("sample.pdf"),
      adapter,
      () => "sample",
    );

    expect(item.id).toBe("sample");
    expect(item.metadata.pageCount).toBe(2);
    expect(item.metadata.pageRotations).toEqual([0, 90]);
    expect(adapter.readMetadata).toHaveBeenCalledOnce();
  });
});

describe("rotateFile", () => {
  it("calls the adapter with page rotations", async () => {
    const adapter = createAdapter();
    const pages = rotatePage(
      createDefaultRotatePages(2, [0, 90]),
      "page-1",
      "right",
    );
    const result = await rotateFile(createItem(), adapter, pages);

    expect(result.filename).toBe("sample-rotated.pdf");
    expect(result.bytes).toEqual(new Uint8Array([9, 8, 7]));
    expect(adapter.rotate).toHaveBeenCalledWith({
      document: createItem().bytes,
      rotations: [
        { pageNumber: 1, rotation: 90 },
        { pageNumber: 2, rotation: 90 },
      ],
    });
  });

  it("rejects invalid rotation state before adapter generation", async () => {
    const adapter = createAdapter();

    await expect(
      rotateFile(createItem(), adapter, [
        { id: "a", pageNumber: 1, rotation: 0 },
        { id: "b", pageNumber: 1, rotation: 90 },
      ]),
    ).rejects.toMatchObject({
      code: "invalid-page-range",
    });
    expect(adapter.rotate).not.toHaveBeenCalled();
  });

  it("maps adapter rotate errors to safe user-facing messages", () => {
    expect(
      getRotateErrorMessage(
        new PdfProcessingError("encrypted-document", "internal encrypted"),
      ),
    ).toBe("Password-protected PDFs are not supported yet.");
  });
});

describe("createRotatedFilename", () => {
  it("generates deterministic user-friendly output names", () => {
    expect(createRotatedFilename("original.pdf")).toBe("original-rotated.pdf");
    expect(createRotatedFilename("Document.PDF")).toBe("Document-rotated.pdf");
    expect(createRotatedFilename("")).toBe("rotated-document.pdf");
  });
});
