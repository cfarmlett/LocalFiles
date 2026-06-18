import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import { validatePdfFile } from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import {
  buildReorderFileItem,
  createDefaultPageOrder,
  getReorderErrorMessage,
  movePage,
  reorderFile,
  type PageListItem,
  type ReorderFileItem,
  type ReorderResult,
} from "./reorderWorkflow";

export type ReorderPagesPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function ReorderPagesPage({
  adapter = defaultAdapter,
}: ReorderPagesPageProps) {
  const [file, setFile] = useState<ReorderFileItem>();
  const [pages, setPages] = useState<readonly PageListItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [reorderResult, setReorderResult] = useState<ReorderResult>();
  const inputRef = useRef<HTMLInputElement>(null);

  const canReorder = file !== undefined && !isReading && !isReordering;
  const canClear =
    file !== undefined ||
    pages.length > 0 ||
    errors.length > 0 ||
    isReading ||
    isReordering ||
    reorderResult !== undefined;
  const exportResults = useMemo<readonly ExportResult[]>(
    () =>
      reorderResult === undefined
        ? []
        : [
            {
              id: reorderResult.filename,
              filename: reorderResult.filename,
              bytes: reorderResult.bytes,
              mimeType: "application/pdf",
            },
          ],
    [reorderResult],
  );
  const downloadableResults = useExportResultUrls(exportResults);

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
    const selected = Array.from(selectedFiles);

    clearOutput();

    if (selected.length === 0) {
      clearSelection();
      setErrors(["Choose one PDF before reordering pages."]);
      return;
    }

    if (selected.length > 1) {
      clearSelection();
      setErrors(["Choose exactly one PDF before reordering pages."]);
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
      const nextFile = await buildReorderFileItem(selectedFile, adapter, () =>
        crypto.randomUUID(),
      );
      setFile(nextFile);
      setPages(createDefaultPageOrder(nextFile.metadata.pageCount));
    } catch (error) {
      clearSelection();
      setErrors([`${selectedFile.name}: ${getReorderErrorMessage(error)}`]);
    } finally {
      setIsReading(false);
      resetInput();
    }
  }

  async function reorderSelectedFile() {
    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before reordering pages."]);
      return;
    }

    setIsReordering(true);

    try {
      setReorderResult(await reorderFile(file, adapter, pages));
    } catch (error) {
      setErrors([getReorderErrorMessage(error)]);
    } finally {
      setIsReordering(false);
    }
  }

  function moveSelectedPage(pageId: string, direction: "up" | "down") {
    setPages((currentPages) => movePage(currentPages, pageId, direction));
    setErrors([]);
    clearOutput();
  }

  function clearSelection() {
    setFile(undefined);
    setPages([]);
  }

  function clearOutput() {
    setReorderResult(undefined);
  }

  function clearWorkflow() {
    clearSelection();
    setErrors([]);
    setIsReading(false);
    setIsReordering(false);
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
          Select one PDF, move pages into the order you want, then generate a
          reordered copy locally in your browser. Files are not uploaded.
        </p>
      </div>

      <label
        className="drop-zone"
        htmlFor="reorder-file-input"
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
          id="reorder-file-input"
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
        <ol className="file-list" aria-label="Pages in reorder output order">
          {pages.map((page, index) => (
            <li className="file-list__item" key={page.id}>
              <div>
                <strong>Page {page.pageNumber}</strong>
                <span>Original page {page.pageNumber}</span>
              </div>
              <div className="file-actions">
                <button
                  aria-label={`Move page ${page.pageNumber} up`}
                  disabled={index === 0}
                  onClick={() => moveSelectedPage(page.id, "up")}
                  type="button"
                >
                  Move up
                </button>
                <button
                  aria-label={`Move page ${page.pageNumber} down`}
                  disabled={index === pages.length - 1}
                  onClick={() => moveSelectedPage(page.id, "down")}
                  type="button"
                >
                  Move down
                </button>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="merge-actions">
        <button
          disabled={!canReorder}
          onClick={reorderSelectedFile}
          type="button"
        >
          {isReordering ? "Reordering..." : "Reorder Pages"}
        </button>
        <button disabled={!canClear} onClick={clearWorkflow} type="button">
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
