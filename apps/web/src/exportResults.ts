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

type DownloadableExportResultState = Readonly<{
  sourceResults: readonly ExportResult[];
  downloadableResults: readonly DownloadableExportResult[];
}>;

export function useExportResultUrls(
  results: readonly ExportResult[],
): readonly DownloadableExportResult[] {
  const [resultState, setResultState] = useState<DownloadableExportResultState>(
    {
      sourceResults: results,
      downloadableResults: [],
    },
  );

  useEffect(() => {
    const nextResults = results.map((result) => ({
      ...result,
      url: createExportObjectUrl(result),
    }));

    setResultState({
      sourceResults: results,
      downloadableResults: nextResults,
    });

    return () => {
      nextResults.forEach((result) => URL.revokeObjectURL(result.url));
    };
  }, [results]);

  if (resultState.sourceResults !== results) {
    return [];
  }

  return resultState.downloadableResults;
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
