import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import { validatePdfFile } from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import {
  buildRotateFileItem,
  createDefaultRotatePages,
  getRotateErrorMessage,
  rotateFile,
  rotatePage,
  type RotateFileItem,
  type RotatePageItem,
  type RotateResult,
} from "./rotateWorkflow";

export type RotatePagesPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function RotatePagesPage({
  adapter = defaultAdapter,
}: RotatePagesPageProps) {
  const [file, setFile] = useState<RotateFileItem>();
  const [pages, setPages] = useState<readonly RotatePageItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [rotateResult, setRotateResult] = useState<RotateResult>();
  const inputRef = useRef<HTMLInputElement>(null);

  const canRotate = file !== undefined && !isReading && !isRotating;
  const exportResults = useMemo<readonly ExportResult[]>(
    () =>
      rotateResult === undefined
        ? []
        : [
            {
              id: rotateResult.filename,
              filename: rotateResult.filename,
              bytes: rotateResult.bytes,
              mimeType: "application/pdf",
            },
          ],
    [rotateResult],
  );
  const downloadableResults = useExportResultUrls(exportResults);

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
    const selected = Array.from(selectedFiles);

    clearOutput();

    if (selected.length === 0) {
      clearSelection();
      setErrors(["Choose one PDF before rotating pages."]);
      return;
    }

    if (selected.length > 1) {
      clearSelection();
      setErrors(["Choose exactly one PDF before rotating pages."]);
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
      const nextFile = await buildRotateFileItem(selectedFile, adapter, () =>
        crypto.randomUUID(),
      );
      setFile(nextFile);
      setPages(
        createDefaultRotatePages(
          nextFile.metadata.pageCount,
          nextFile.metadata.pageRotations,
        ),
      );
    } catch (error) {
      clearSelection();
      setErrors([`${selectedFile.name}: ${getRotateErrorMessage(error)}`]);
    } finally {
      setIsReading(false);
      resetInput();
    }
  }

  async function rotateSelectedFile() {
    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before rotating pages."]);
      return;
    }

    setIsRotating(true);

    try {
      setRotateResult(await rotateFile(file, adapter, pages));
    } catch (error) {
      setErrors([getRotateErrorMessage(error)]);
    } finally {
      setIsRotating(false);
    }
  }

  function rotateSelectedPage(pageId: string, direction: "left" | "right") {
    setPages((currentPages) => rotatePage(currentPages, pageId, direction));
    setErrors([]);
    clearOutput();
  }

  function clearSelection() {
    setFile(undefined);
    setPages([]);
  }

  function clearOutput() {
    setRotateResult(undefined);
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
          Select one PDF, rotate individual pages, then generate a rotated copy
          locally in your browser. Files are not uploaded.
        </p>
      </div>

      <label
        className="drop-zone"
        htmlFor="rotate-file-input"
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
          Only one PDF is accepted. Processing stays on this device.
        </span>
        <input
          accept="application/pdf,.pdf"
          id="rotate-file-input"
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

      {pages.length > 0 ? (
        <ol className="file-list" aria-label="Pages with rotation settings">
          {pages.map((page) => (
            <li className="file-list__item" key={page.id}>
              <div>
                <strong>Page {page.pageNumber}</strong>
                <span>Rotation {page.rotation} degrees</span>
              </div>
              <div className="file-actions">
                <button
                  aria-label={`Rotate page ${page.pageNumber} left`}
                  onClick={() => rotateSelectedPage(page.id, "left")}
                  type="button"
                >
                  Rotate left
                </button>
                <button
                  aria-label={`Rotate page ${page.pageNumber} right`}
                  onClick={() => rotateSelectedPage(page.id, "right")}
                  type="button"
                >
                  Rotate right
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="merge-actions">
        <button
          disabled={!canRotate}
          onClick={rotateSelectedFile}
          type="button"
        >
          {isRotating ? "Rotating..." : "Rotate Pages"}
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
