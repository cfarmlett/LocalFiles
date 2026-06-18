import type { SplitOutput } from "./splitWorkflow";

export type ZipEntry = Readonly<{
  filename: string;
  bytes: Uint8Array;
}>;

const textEncoder = new TextEncoder();
const crcTable = createCrcTable();

export function createSplitZipFilename(filename: string): string {
  const baseName = filename.replace(/\.pdf$/i, "");

  return `${baseName}-split.zip`;
}

export function createSplitZipEntries(
  outputs: readonly SplitOutput[],
): readonly ZipEntry[] {
  return outputs.map((output) => ({
    filename: output.filename,
    bytes: output.bytes,
  }));
}

export function createZipArchive(entries: readonly ZipEntry[]): Uint8Array {
  if (entries.length === 0) {
    throw new Error("Create split PDFs before downloading a ZIP.");
  }

  const localFileParts: Uint8Array[] = [];
  const centralDirectoryParts: Uint8Array[] = [];
  let offset = 0;

  entries.forEach((entry) => {
    const filenameBytes = textEncoder.encode(entry.filename);
    const crc = calculateCrc32(entry.bytes);
    const localHeader = createLocalFileHeader(
      filenameBytes,
      crc,
      entry.bytes.byteLength,
    );
    const centralDirectoryHeader = createCentralDirectoryHeader(
      filenameBytes,
      crc,
      entry.bytes.byteLength,
      offset,
    );

    localFileParts.push(localHeader, entry.bytes);
    centralDirectoryParts.push(centralDirectoryHeader);
    offset += localHeader.byteLength + entry.bytes.byteLength;
  });

  const centralDirectorySize = centralDirectoryParts.reduce(
    (total, part) => total + part.byteLength,
    0,
  );
  const endOfCentralDirectory = createEndOfCentralDirectoryRecord(
    entries.length,
    centralDirectorySize,
    offset,
  );

  return concatBytes([
    ...localFileParts,
    ...centralDirectoryParts,
    endOfCentralDirectory,
  ]);
}

function createLocalFileHeader(
  filenameBytes: Uint8Array,
  crc: number,
  byteLength: number,
): Uint8Array {
  const header = new Uint8Array(30 + filenameBytes.byteLength);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, byteLength, true);
  view.setUint32(22, byteLength, true);
  view.setUint16(26, filenameBytes.byteLength, true);
  view.setUint16(28, 0, true);
  header.set(filenameBytes, 30);

  return header;
}

function createCentralDirectoryHeader(
  filenameBytes: Uint8Array,
  crc: number,
  byteLength: number,
  offset: number,
): Uint8Array {
  const header = new Uint8Array(46 + filenameBytes.byteLength);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, byteLength, true);
  view.setUint32(24, byteLength, true);
  view.setUint16(28, filenameBytes.byteLength, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  header.set(filenameBytes, 46);

  return header;
}

function createEndOfCentralDirectoryRecord(
  entryCount: number,
  centralDirectorySize: number,
  centralDirectoryOffset: number,
): Uint8Array {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralDirectorySize, true);
  view.setUint32(16, centralDirectoryOffset, true);
  view.setUint16(20, 0, true);

  return record;
}

function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
  const byteLength = parts.reduce((total, part) => total + part.byteLength, 0);
  const bytes = new Uint8Array(byteLength);
  let offset = 0;

  parts.forEach((part) => {
    bytes.set(part, offset);
    offset += part.byteLength;
  });

  return bytes;
}

function calculateCrc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  bytes.forEach((byte) => {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  });

  return (crc ^ 0xffffffff) >>> 0;
}

function createCrcTable(): Uint32Array {
  const table = new Uint32Array(256);

  for (let index = 0; index < table.length; index += 1) {
    let crc = index;

    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }

    table[index] = crc >>> 0;
  }

  return table;
}
