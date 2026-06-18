import { describe, expect, it } from "vitest";

import {
  createSplitZipEntries,
  createSplitZipFilename,
  createZipArchive,
  ZipArchiveError,
} from "./splitZip";
import type { SplitOutput } from "./splitWorkflow";

const textDecoder = new TextDecoder();

describe("createSplitZipFilename", () => {
  it("adds the split suffix before the ZIP extension", () => {
    expect(createSplitZipFilename("contract.pdf")).toBe("contract-split.zip");
    expect(createSplitZipFilename("my.document.pdf")).toBe(
      "my.document-split.zip",
    );
  });
});

describe("createSplitZipEntries", () => {
  it("maps split outputs without changing output filenames or bytes", () => {
    const outputs: readonly SplitOutput[] = [
      {
        bytes: new Uint8Array([1, 2, 3]),
        filename: "page-1.pdf",
        range: { start: 1, end: 1 },
      },
      {
        bytes: new Uint8Array([4, 5, 6]),
        filename: "page-2.pdf",
        range: { start: 2, end: 2 },
      },
    ];

    expect(createSplitZipEntries(outputs)).toEqual([
      { filename: "page-1.pdf", bytes: outputs[0].bytes },
      { filename: "page-2.pdf", bytes: outputs[1].bytes },
    ]);
  });
});

describe("createZipArchive", () => {
  it("creates a local ZIP archive containing generated split PDFs", () => {
    const archive = createZipArchive([
      { filename: "page-1.pdf", bytes: new Uint8Array([1, 2, 3]) },
      { filename: "page-2.pdf", bytes: new Uint8Array([4, 5]) },
    ]);
    const contents = textDecoder.decode(archive);

    expect(archive[0]).toBe(0x50);
    expect(archive[1]).toBe(0x4b);
    expect(contents).toContain("page-1.pdf");
    expect(contents).toContain("page-2.pdf");
    expect(readEndOfCentralDirectory(archive)).toMatchObject({
      centralDirectoryEntries: 2,
    });
  });

  it("rejects empty archives", () => {
    expect(() => createZipArchive([])).toThrow(
      "Create split PDFs before downloading a ZIP.",
    );
  });

  it("rejects archives that exceed the ZIP32 entry count limit", () => {
    expect(() =>
      createZipArchive(
        [
          { filename: "page-1.pdf", bytes: new Uint8Array([1]) },
          { filename: "page-2.pdf", bytes: new Uint8Array([2]) },
        ],
        {
          maxEntryCount: 1,
          maxFieldLength: 0xffff,
          maxFieldValue: 0xffffffff,
        },
      ),
    ).toThrow(ZipArchiveError);
  });

  it("rejects entries that exceed ZIP32 field limits", () => {
    expect(() =>
      createZipArchive(
        [{ filename: "long-name.pdf", bytes: new Uint8Array([1]) }],
        {
          maxEntryCount: 0xffff,
          maxFieldLength: 4,
          maxFieldValue: 0xffffffff,
        },
      ),
    ).toThrow("ZIP export exceeds supported ZIP32 filename length limits.");

    expect(() =>
      createZipArchive(
        [{ filename: "page-1.pdf", bytes: new Uint8Array([1, 2]) }],
        {
          maxEntryCount: 0xffff,
          maxFieldLength: 0xffff,
          maxFieldValue: 1,
        },
      ),
    ).toThrow("ZIP export exceeds supported ZIP32 entry size limits.");
  });

  it("rejects central directory and archive offsets that exceed ZIP32 limits", () => {
    expect(() =>
      createZipArchive(
        [
          { filename: "a.pdf", bytes: new Uint8Array() },
          { filename: "b.pdf", bytes: new Uint8Array() },
        ],
        {
          maxEntryCount: 0xffff,
          maxFieldLength: 0xffff,
          maxFieldValue: 32,
        },
      ),
    ).toThrow("ZIP export exceeds supported ZIP32 archive offset limits.");

    expect(() =>
      createZipArchive(
        [
          { filename: "a.pdf", bytes: new Uint8Array() },
          { filename: "b.pdf", bytes: new Uint8Array() },
        ],
        {
          maxEntryCount: 0xffff,
          maxFieldLength: 0xffff,
          maxFieldValue: 90,
        },
      ),
    ).toThrow(
      "ZIP export exceeds supported ZIP32 central directory size limits.",
    );
  });
});

function readEndOfCentralDirectory(archive: Uint8Array) {
  const view = new DataView(archive.buffer);
  const offset = archive.byteLength - 22;

  expect(view.getUint32(offset, true)).toBe(0x06054b50);

  return {
    centralDirectoryEntries: view.getUint16(offset + 10, true),
  };
}
