import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localfiles/pdf";

import { createAsyncOperationTracker } from "./asyncOperationToken";
import { CollapsibleSection } from "./CollapsibleSection";
import {
  buildMergeFileItem,
  getPdfErrorMessage,
  mergeFiles,
  moveMergeFile,
  removeMergeFile,
  sortFilesByNaturalFilename,
  validatePdfFile,
  type MergeFileItem,
  type MergeResult,
} from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import { PdfFilePicker } from "./PdfFilePicker";

export type MergePdfPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function MergePdfPage({ adapter = defaultAdapter }: MergePdfPageProps) {
  const [files, setFiles] = useState<MergeFileItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [isFileListExpanded, setIsFileListExpanded] = useState(true);
  const [mergeResult, setMergeResult] = useState<MergeResult>();
  const inputRef = useRef<HTMLInputElement>(null);
  const asyncOperations = useRef(createAsyncOperationTracker());

  const canMerge = files.length > 0 && !isReading && !isMerging;
  const canClear =
    files.length > 0 ||
    errors.length > 0 ||
    isReading ||
    isMerging ||
    mergeResult !== undefined;
  const exportResults = useMemo<readonly ExportResult[]>(
    () =>
      mergeResult === undefined
        ? []
        : [
            {
              id: mergeResult.filename,
              filename: mergeResult.filename,
              bytes: mergeResult.bytes,
              mimeType: "application/pdf",
            },
          ],
    [mergeResult],
  );
  const downloadableResults = useExportResultUrls(exportResults);

  const totalPages = useMemo(
    () => files.reduce((sum, file) => sum + (file.metadata?.pageCount ?? 0), 0),
    [files],
  );
  const selectionSummary =
    files.length === 0
      ? "No PDFs selected yet."
      : `${files.length} PDF${files.length === 1 ? "" : "s"} selected${
          totalPages > 0 ? `, ${totalPages} total pages` : ""
        }.`;

  async function addFiles(selectedFiles: FileList | readonly File[]) {
    const operationToken = asyncOperations.current.begin();

    setMergeResult(undefined);

    const nextErrors: string[] = [];
    const pdfFiles = sortFilesByNaturalFilename(
      Array.from(selectedFiles).filter((file) => {
        const validation = validatePdfFile(file);

        if (!validation.valid) {
          nextErrors.push(validation.message);
          return false;
        }

        return true;
      }),
    );

    if (pdfFiles.length === 0) {
      setErrors(nextErrors);
      return;
    }

    setIsReading(true);

    const nextItems: MergeFileItem[] = [];

    for (const file of pdfFiles) {
      try {
        const nextItem = await buildMergeFileItem(file, adapter, () =>
          crypto.randomUUID(),
        );

        if (!asyncOperations.current.isCurrent(operationToken)) {
          return;
        }

        nextItems.push(nextItem);
      } catch (error) {
        if (!asyncOperations.current.isCurrent(operationToken)) {
          return;
        }

        nextErrors.push(`${file.name}: ${getPdfErrorMessage(error)}`);
      }
    }

    if (!asyncOperations.current.isCurrent(operationToken)) {
      return;
    }

    setFiles((currentFiles) => [...currentFiles, ...nextItems]);
    setIsFileListExpanded(true);
    setErrors(nextErrors);
    setIsReading(false);

    resetInput();
  }

  async function mergeSelectedFiles() {
    const operationToken = asyncOperations.current.begin();

    setErrors([]);
    setMergeResult(undefined);
    setIsMerging(true);

    try {
      const nextResult = await mergeFiles(files, adapter);

      if (asyncOperations.current.isCurrent(operationToken)) {
        setMergeResult(nextResult);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setErrors([getPdfErrorMessage(error)]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsMerging(false);
      }
    }
  }

  function clearWorkflow() {
    asyncOperations.current.invalidate();
    setFiles([]);
    setErrors([]);
    setIsReading(false);
    setIsMerging(false);
    setIsFileListExpanded(true);
    setMergeResult(undefined);
    resetInput();
  }

  function resetInput() {
    if (inputRef.current !== null) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="merge-tool">
      <div className="tool-intro">
        <p>
          Select one or more PDFs, put them in the order you want, then merge
          them locally in your browser. Files are not uploaded.
        </p>
      </div>

      <PdfFilePicker
        errors={errors}
        inputId="merge-file-input"
        inputRef={inputRef}
        multiple
        onFilesSelected={(selectedFiles) => {
          void addFiles(selectedFiles);
        }}
        selectionSummary={selectionSummary}
      />

      {files.length > 0 ? (
        <CollapsibleSection
          isOpen={isFileListExpanded}
          onToggle={setIsFileListExpanded}
          title={`Selected PDF${files.length === 1 ? "" : "s"} (${files.length})`}
        >
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
        </CollapsibleSection>
      ) : null}

      <div className="merge-actions">
        <button disabled={!canMerge} onClick={mergeSelectedFiles} type="button">
          {isMerging ? "Merging..." : "Merge PDFs"}
        </button>
        <button
          aria-label="Clear Merge PDF"
          disabled={!canClear}
          onClick={clearWorkflow}
          type="button"
        >
          Clear
        </button>
      </div>

      <ExportResultPanel results={downloadableResults} />

      {isReading ? (
        <p aria-live="polite" className="loading-note">
          Reading PDFs locally...
        </p>
      ) : null}
    </div>
  );
}
