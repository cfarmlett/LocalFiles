import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localfiles/pdf";

import { createAsyncOperationTracker } from "./asyncOperationToken";
import { CollapsibleSection } from "./CollapsibleSection";
import { validatePdfFile } from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import { PdfFilePicker } from "./PdfFilePicker";
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
  const [isPageListExpanded, setIsPageListExpanded] = useState(true);
  const [rotateResult, setRotateResult] = useState<RotateResult>();
  const inputRef = useRef<HTMLInputElement>(null);
  const asyncOperations = useRef(createAsyncOperationTracker());

  const canRotate = file !== undefined && !isReading && !isRotating;
  const canClear =
    file !== undefined ||
    pages.length > 0 ||
    errors.length > 0 ||
    isReading ||
    isRotating ||
    rotateResult !== undefined;
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
    const operationToken = asyncOperations.current.begin();
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

      if (asyncOperations.current.isCurrent(operationToken)) {
        setFile(nextFile);
        setPages(
          createDefaultRotatePages(
            nextFile.metadata.pageCount,
            nextFile.metadata.pageRotations,
          ),
        );
        setIsPageListExpanded(true);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        clearSelection();
        setErrors([`${selectedFile.name}: ${getRotateErrorMessage(error)}`]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsReading(false);
        resetInput();
      }
    }
  }

  async function rotateSelectedFile() {
    const operationToken = asyncOperations.current.begin();

    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before rotating pages."]);
      return;
    }

    setIsRotating(true);

    try {
      const nextResult = await rotateFile(file, adapter, pages);

      if (asyncOperations.current.isCurrent(operationToken)) {
        setRotateResult(nextResult);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setErrors([getRotateErrorMessage(error)]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsRotating(false);
      }
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

  function clearWorkflow() {
    asyncOperations.current.invalidate();
    clearSelection();
    setErrors([]);
    setIsReading(false);
    setIsRotating(false);
    setIsPageListExpanded(true);
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
          Select one PDF, rotate individual pages, then generate a rotated copy
          locally in your browser. Files are not uploaded.
        </p>
      </div>

      <PdfFilePicker
        errors={errors}
        inputId="rotate-file-input"
        inputRef={inputRef}
        onFilesSelected={(selectedFiles) => {
          void selectFiles(selectedFiles);
        }}
        selectionSummary={
          file === undefined
            ? "No PDF selected yet."
            : `${file.file.name}, ${file.metadata.pageCount} page${
                file.metadata.pageCount === 1 ? "" : "s"
              }.`
        }
      />

      {pages.length > 0 ? (
        <CollapsibleSection
          isOpen={isPageListExpanded}
          onToggle={setIsPageListExpanded}
          title={`Page Rotations (${pages.length} Page${pages.length === 1 ? "" : "s"})`}
        >
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
        </CollapsibleSection>
      ) : null}

      <div className="merge-actions">
        <button
          disabled={!canRotate}
          onClick={rotateSelectedFile}
          type="button"
        >
          {isRotating ? "Rotating..." : "Rotate Pages"}
        </button>
        <button
          aria-label="Clear Rotate Pages"
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
