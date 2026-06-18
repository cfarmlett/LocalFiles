import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import { createAsyncOperationTracker } from "./asyncOperationToken";
import {
  buildMetadataRemovalFileItem,
  getMetadataDisplayFields,
  getMetadataRemovalErrorMessage,
  removeMetadataFromFile,
  type MetadataRemovalFileItem,
  type MetadataRemovalResult,
} from "./metadataRemovalWorkflow";
import { validatePdfFile } from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";

export type MetadataRemovalPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function MetadataRemovalPage({
  adapter = defaultAdapter,
}: MetadataRemovalPageProps) {
  const [file, setFile] = useState<MetadataRemovalFileItem>();
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalResult, setRemovalResult] = useState<MetadataRemovalResult>();
  const inputRef = useRef<HTMLInputElement>(null);
  const asyncOperations = useRef(createAsyncOperationTracker());

  const canRemove = file !== undefined && !isReading && !isRemoving;
  const canClear =
    file !== undefined ||
    errors.length > 0 ||
    isReading ||
    isRemoving ||
    removalResult !== undefined;
  const metadataFields = useMemo(
    () => (file === undefined ? [] : getMetadataDisplayFields(file.metadata)),
    [file],
  );
  const exportResults = useMemo<readonly ExportResult[]>(
    () =>
      removalResult === undefined
        ? []
        : [
            {
              id: removalResult.filename,
              filename: removalResult.filename,
              bytes: removalResult.bytes,
              mimeType: "application/pdf",
            },
          ],
    [removalResult],
  );
  const downloadableResults = useExportResultUrls(exportResults);

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
    const operationToken = asyncOperations.current.begin();
    const selected = Array.from(selectedFiles);

    clearOutput();

    if (selected.length === 0) {
      clearSelection();
      setErrors(["Choose one PDF before removing metadata."]);
      return;
    }

    if (selected.length > 1) {
      clearSelection();
      setErrors(["Choose exactly one PDF before removing metadata."]);
      resetInput();
      return;
    }

    const selectedFile = selected[0];
    const validation = validatePdfFile(selectedFile);

    if (!validation.valid) {
      clearSelection();
      setErrors([validation.message]);
      resetInput();
      return;
    }

    setIsReading(true);
    clearSelection();
    setErrors([]);

    try {
      const nextFile = await buildMetadataRemovalFileItem(
        selectedFile,
        adapter,
        () => crypto.randomUUID(),
      );

      if (asyncOperations.current.isCurrent(operationToken)) {
        setFile(nextFile);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        clearSelection();
        setErrors([
          `${selectedFile.name}: ${getMetadataRemovalErrorMessage(error)}`,
        ]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsReading(false);
        resetInput();
      }
    }
  }

  async function removeSelectedMetadata() {
    const operationToken = asyncOperations.current.begin();

    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before removing metadata."]);
      return;
    }

    setIsRemoving(true);

    try {
      const nextResult = await removeMetadataFromFile(file, adapter);

      if (asyncOperations.current.isCurrent(operationToken)) {
        setRemovalResult(nextResult);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setErrors([getMetadataRemovalErrorMessage(error)]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsRemoving(false);
      }
    }
  }

  function clearSelection() {
    setFile(undefined);
  }

  function clearOutput() {
    setRemovalResult(undefined);
  }

  function clearWorkflow() {
    asyncOperations.current.invalidate();
    clearSelection();
    setErrors([]);
    setIsReading(false);
    setIsRemoving(false);
    clearOutput();
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
          Select one PDF, inspect standard document metadata, then generate a
          copy with those displayed fields removed locally in your browser.
          Files are not uploaded.
        </p>
      </div>

      <label
        className="drop-zone"
        htmlFor="metadata-file-input"
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();
          void selectFiles(event.dataTransfer.files);
        }}
      >
        <span className="drop-zone__title">Choose one PDF or drop it here</span>
        <span className="drop-zone__copy">
          Standard PDF document metadata exposed here can be removed. Processing
          stays on this device.
        </span>
        <input
          accept="application/pdf,.pdf"
          id="metadata-file-input"
          onChange={(event) => {
            if (event.currentTarget.files !== null) {
              void selectFiles(event.currentTarget.files);
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
        {file === undefined
          ? "No PDF selected yet."
          : `${file.file.name}, ${file.metadata.pageCount} page${
              file.metadata.pageCount === 1 ? "" : "s"
            }.`}
      </div>

      {file !== undefined ? (
        metadataFields.length > 0 ? (
          <ol className="file-list" aria-label="Detected removable metadata">
            {metadataFields.map((field) => (
              <li className="file-list__item" key={field.label}>
                <div>
                  <strong>{field.label}</strong>
                  <span>{field.value}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p aria-live="polite" className="loading-note">
            No removable standard metadata was found.
          </p>
        )
      ) : null}

      <div className="merge-actions">
        <button
          disabled={!canRemove}
          onClick={removeSelectedMetadata}
          type="button"
        >
          {isRemoving ? "Removing..." : "Remove Metadata"}
        </button>
        <button
          aria-label="Clear Remove Metadata"
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
          Reading PDF locally...
        </p>
      ) : null}
    </div>
  );
}
