import { useEffect, useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import {
  buildMetadataRemovalFileItem,
  getMetadataDisplayFields,
  getMetadataRemovalErrorMessage,
  removeMetadataFromFile,
  type MetadataRemovalFileItem,
  type MetadataRemovalResult,
} from "./metadataRemovalWorkflow";
import { validatePdfFile } from "./mergeWorkflow";
import { createPdfObjectUrl } from "./pdfObjectUrl";

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
  const [downloadUrl, setDownloadUrl] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  const canRemove = file !== undefined && !isReading && !isRemoving;
  const metadataFields = useMemo(
    () => (file === undefined ? [] : getMetadataDisplayFields(file.metadata)),
    [file],
  );

  useEffect(() => {
    if (removalResult === undefined) {
      setDownloadUrl(undefined);
      return undefined;
    }

    const objectUrl = createPdfObjectUrl(removalResult.bytes);
    setDownloadUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [removalResult]);

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
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
      setFile(
        await buildMetadataRemovalFileItem(selectedFile, adapter, () =>
          crypto.randomUUID(),
        ),
      );
    } catch (error) {
      clearSelection();
      setErrors([
        `${selectedFile.name}: ${getMetadataRemovalErrorMessage(error)}`,
      ]);
    } finally {
      setIsReading(false);
      resetInput();
    }
  }

  async function removeSelectedMetadata() {
    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before removing metadata."]);
      return;
    }

    setIsRemoving(true);

    try {
      setRemovalResult(await removeMetadataFromFile(file, adapter));
    } catch (error) {
      setErrors([getMetadataRemovalErrorMessage(error)]);
    } finally {
      setIsRemoving(false);
    }
  }

  function clearSelection() {
    setFile(undefined);
  }

  function clearOutput() {
    setRemovalResult(undefined);
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
        {downloadUrl !== undefined && removalResult !== undefined ? (
          <a download={removalResult.filename} href={downloadUrl}>
            Download cleaned PDF
          </a>
        ) : null}
      </div>

      {isReading ? (
        <p aria-live="polite" className="loading-note">
          Reading PDF locally...
        </p>
      ) : null}
    </div>
  );
}
