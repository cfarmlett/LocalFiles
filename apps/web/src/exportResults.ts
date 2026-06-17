import { useEffect, useState } from "react";

import { createPdfObjectUrl } from "./pdfObjectUrl";

export type ExportResultMimeType = "application/pdf" | "application/zip";

export type ExportResult = Readonly<{
  id: string;
  filename: string;
  bytes: Uint8Array;
  mimeType: ExportResultMimeType;
  detail?: string;
}>;

export type DownloadableExportResult = ExportResult &
  Readonly<{
    url: string;
  }>;

export function useExportResultUrls(
  results: readonly ExportResult[],
): readonly DownloadableExportResult[] {
  const [downloadableResults, setDownloadableResults] = useState<
    readonly DownloadableExportResult[]
  >([]);

  useEffect(() => {
    const nextResults = results.map((result) => ({
      ...result,
      url: createExportObjectUrl(result),
    }));

    setDownloadableResults(nextResults);

    return () => {
      nextResults.forEach((result) => URL.revokeObjectURL(result.url));
    };
  }, [results]);

  return downloadableResults;
}

function createExportObjectUrl(result: ExportResult): string {
  if (result.mimeType === "application/pdf") {
    return createPdfObjectUrl(result.bytes);
  }

  const bytes = new ArrayBuffer(result.bytes.byteLength);
  new Uint8Array(bytes).set(result.bytes);

  return URL.createObjectURL(
    new Blob([bytes], {
      type: result.mimeType,
    }),
  );
}
