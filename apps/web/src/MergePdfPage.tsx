import { useEffect, useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import {
  buildMergeFileItem,
  getPdfErrorMessage,
  mergeFiles,
  moveMergeFile,
  removeMergeFile,
  validatePdfFile,
  type MergeFileItem,
  type MergeResult,
} from "./mergeWorkflow";

export type MergePdfPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function MergePdfPage({ adapter = defaultAdapter }: MergePdfPageProps) {
  const [files, setFiles] = useState<MergeFileItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeResult, setMergeResult] = useState<MergeResult>();
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const canMerge = files.length > 0 && !isReading && !isMerging;

  useEffect(() => {
    if (mergeResult === undefined) {
      setDownloadUrl(undefined);
      return undefined;
    }

    const pdfBytes = new ArrayBuffer(mergeResult.bytes.byteLength);
    new Uint8Array(pdfBytes).set(mergeResult.bytes);

    const blob = new Blob([pdfBytes], {
      type: "application/pdf",
    });
    const objectUrl = URL.createObjectURL(blob);
    setDownloadUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [mergeResult]);

  const totalPages = useMemo(
    () => files.reduce((sum, file) => sum + (file.metadata?.pageCount ?? 0), 0),
    [files],
  );

  async function addFiles(selectedFiles: FileList | readonly File[]) {
    const nextErrors: string[] = [];
    const pdfFiles = Array.from(selectedFiles).filter((file) => {
      const validation = validatePdfFile(file);

      if (!validation.valid) {
        nextErrors.push(validation.message);
        return false;
      }

      return true;
    });

    if (pdfFiles.length === 0) {
      setErrors(nextErrors);
      return;
    }

    setIsReading(true);
    setMergeResult(undefined);

    const nextItems: MergeFileItem[] = [];

    for (const file of pdfFiles) {
      try {
        nextItems.push(
          await buildMergeFileItem(file, adapter, () => crypto.randomUUID()),
        );
      } catch (error) {
        nextErrors.push(`${file.name}: ${getPdfErrorMessage(error)}`);
      }
    }

    setFiles((currentFiles) => [...currentFiles, ...nextItems]);
    setErrors(nextErrors);
    setIsReading(false);

    if (inputRef.current !== null) {
      inputRef.current.value = "";
    }
  }

  async function mergeSelectedFiles() {
    setErrors([]);
    setMergeResult(undefined);
    setIsMerging(true);

    try {
      setMergeResult(await mergeFiles(files, adapter));
    } catch (error) {
      setErrors([getPdfErrorMessage(error)]);
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="merge-tool">
      <div className="tool-intro">
        <p>
          Select two or more PDFs, put them in the order you want, then merge
          them locally in your browser. Files are not uploaded.
        </p>
      </div>

      <label
        className="drop-zone"
        htmlFor="merge-file-input"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          void addFiles(event.dataTransfer.files);
        }}
      >
        <span className="drop-zone__title">Choose PDFs or drop them here</span>
        <span className="drop-zone__copy">
          Only PDF files are accepted. Processing stays on this device.
        </span>
        <input
          accept="application/pdf,.pdf"
          id="merge-file-input"
          multiple
          onChange={(event) => {
            if (event.currentTarget.files !== null) {
              void addFiles(event.currentTarget.files);
            }
          }}
          ref={inputRef}
          type="file"
        />
      </label>

      {errors.length > 0 ? (
        <div aria-live="polite" className="error-list" role="alert">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      ) : null}

      <div className="merge-summary" aria-live="polite">
        {files.length === 0
          ? "No PDFs selected yet."
          : `${files.length} PDF${files.length === 1 ? "" : "s"} selected${
              totalPages > 0 ? `, ${totalPages} total pages` : ""
            }.`}
      </div>

      {files.length > 0 ? (
        <ol className="file-list" aria-label="Selected PDFs in merge order">
          {files.map((file, index) => (
            <li className="file-list__item" key={file.id}>
              <div>
                <strong>{file.file.name}</strong>
                <span>
                  {file.metadata?.pageCount === undefined
                    ? "Page count unavailable"
                    : `${file.metadata.pageCount} page${
                        file.metadata.pageCount === 1 ? "" : "s"
                      }`}
                </span>
              </div>
              <div className="file-actions">
                <button
                  aria-label={`Move ${file.file.name} up`}
                  disabled={index === 0}
                  onClick={() => {
                    setFiles((currentFiles) =>
                      moveMergeFile(currentFiles, file.id, "up"),
                    );
                    setErrors([]);
                    setMergeResult(undefined);
                  }}
                  type="button"
                >
                  Move up
                </button>
                <button
                  aria-label={`Move ${file.file.name} down`}
                  disabled={index === files.length - 1}
                  onClick={() => {
                    setFiles((currentFiles) =>
                      moveMergeFile(currentFiles, file.id, "down"),
                    );
                    setErrors([]);
                    setMergeResult(undefined);
                  }}
                  type="button"
                >
                  Move down
                </button>
                <button
                  aria-label={`Remove ${file.file.name}`}
                  onClick={() => {
                    setFiles((currentFiles) =>
                      removeMergeFile(currentFiles, file.id),
                    );
                    setErrors([]);
                    setMergeResult(undefined);
                  }}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="merge-actions">
        <button disabled={!canMerge} onClick={mergeSelectedFiles} type="button">
          {isMerging ? "Merging..." : "Merge PDFs"}
        </button>
        {downloadUrl !== undefined && mergeResult !== undefined ? (
          <a download={mergeResult.filename} href={downloadUrl}>
            Download merged PDF
          </a>
        ) : null}
      </div>

      {isReading ? (
        <p aria-live="polite" className="loading-note">
          Reading PDFs locally...
        </p>
      ) : null}
    </div>
  );
}
