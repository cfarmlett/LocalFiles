import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import { createAsyncOperationTracker } from "./asyncOperationToken";
import { CollapsibleSection } from "./CollapsibleSection";
import { validatePdfFile } from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import {
  buildReorderFileItem,
  createDefaultPageOrder,
  getReorderErrorMessage,
  movePage,
  movePageBefore,
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
  const [originalPages, setOriginalPages] = useState<readonly PageListItem[]>(
    [],
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isPageListExpanded, setIsPageListExpanded] = useState(true);
  const [draggedPageId, setDraggedPageId] = useState<string>();
  const [dragTargetPageId, setDragTargetPageId] = useState<string>();
  const [reorderResult, setReorderResult] = useState<ReorderResult>();
  const inputRef = useRef<HTMLInputElement>(null);
  const asyncOperations = useRef(createAsyncOperationTracker());

  const canReorder = file !== undefined && !isReading && !isReordering;
  const canResetOrder =
    file !== undefined &&
    !isReading &&
    !isReordering &&
    !pageOrdersMatch(pages, originalPages);
  const canClear =
    file !== undefined ||
    pages.length > 0 ||
    originalPages.length > 0 ||
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
    const operationToken = asyncOperations.current.begin();
    const selected = Array.from(selectedFiles);

    clearDragState();
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

      if (asyncOperations.current.isCurrent(operationToken)) {
        const defaultPages = createDefaultPageOrder(
          nextFile.metadata.pageCount,
        );

        setFile(nextFile);
        setPages(defaultPages);
        setOriginalPages(defaultPages);
        setIsPageListExpanded(true);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        clearSelection();
        setErrors([`${selectedFile.name}: ${getReorderErrorMessage(error)}`]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsReading(false);
        resetInput();
      }
    }
  }

  async function reorderSelectedFile() {
    const operationToken = asyncOperations.current.begin();

    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before reordering pages."]);
      return;
    }

    setIsReordering(true);

    try {
      const nextResult = await reorderFile(file, adapter, pages);

      if (asyncOperations.current.isCurrent(operationToken)) {
        setReorderResult(nextResult);
      }
    } catch (error) {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setErrors([getReorderErrorMessage(error)]);
      }
    } finally {
      if (asyncOperations.current.isCurrent(operationToken)) {
        setIsReordering(false);
      }
    }
  }

  function moveSelectedPage(pageId: string, direction: "up" | "down") {
    updatePageOrder((currentPages) =>
      movePage(currentPages, pageId, direction),
    );
  }

  function dragPageBefore(targetPageId: string, dataTransfer: DataTransfer) {
    const draggedId =
      dataTransfer.getData("text/plain").trim() || draggedPageId;

    if (draggedId === undefined || draggedId === "") {
      clearDragState();
      return;
    }

    updatePageOrder((currentPages) =>
      movePageBefore(currentPages, draggedId, targetPageId),
    );
    clearDragState();
  }

  function updatePageOrder(
    createNextPages: (
      currentPages: readonly PageListItem[],
    ) => readonly PageListItem[],
  ) {
    setPages((currentPages) => {
      const nextPages = createNextPages(currentPages);

      if (pageOrdersMatch(currentPages, nextPages)) {
        return currentPages;
      }

      setErrors([]);
      clearOutput();

      return nextPages;
    });
  }

  function resetPageOrder() {
    if (
      file === undefined ||
      isReading ||
      isReordering ||
      pageOrdersMatch(pages, originalPages)
    ) {
      return;
    }

    setPages([...originalPages]);
    setErrors([]);
    clearOutput();
  }

  function clearSelection() {
    clearDragState();
    setFile(undefined);
    setPages([]);
    setOriginalPages([]);
  }

  function clearOutput() {
    setReorderResult(undefined);
  }

  function clearWorkflow() {
    asyncOperations.current.invalidate();
    clearSelection();
    setErrors([]);
    setIsReading(false);
    setIsReordering(false);
    setIsPageListExpanded(true);
    clearDragState();
    clearOutput();
    resetInput();
  }

  function clearDragState() {
    setDraggedPageId(undefined);
    setDragTargetPageId(undefined);
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
          event.dataTransfer.dropEffect = isFileDrop(event.dataTransfer)
            ? "copy"
            : "none";
        }}
        onDrop={(event) => {
          event.preventDefault();
          if (!isFileDrop(event.dataTransfer)) {
            clearDragState();
            return;
          }

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
        <CollapsibleSection
          isOpen={isPageListExpanded}
          onToggle={setIsPageListExpanded}
          title={`Page Order (${pages.length} Page${pages.length === 1 ? "" : "s"})`}
        >
          <ol className="file-list" aria-label="Pages in reorder output order">
            {pages.map((page, index) => (
              <li
                className={`file-list__item${
                  draggedPageId === page.id ? " file-list__item--dragging" : ""
                }${
                  dragTargetPageId === page.id
                    ? " file-list__item--drag-target"
                    : ""
                }`}
                key={page.id}
                onDragEnd={clearDragState}
                onDragEnter={(event) => {
                  event.preventDefault();
                  setDragTargetPageId(page.id);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  setDragTargetPageId(page.id);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  dragPageBefore(page.id, event.dataTransfer);
                }}
              >
                <div>
                  <strong>Page {page.pageNumber}</strong>
                  <span>Original page {page.pageNumber}</span>
                </div>
                <div className="file-actions">
                  <span
                    aria-hidden="true"
                    className="drag-handle"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", page.id);
                      setDraggedPageId(page.id);
                      setDragTargetPageId(undefined);
                    }}
                    title="Drag to reorder"
                  >
                    Drag
                  </span>
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
        </CollapsibleSection>
      ) : null}

      {file !== undefined ? (
        <div className="page-order-actions">
          <button
            disabled={!canResetOrder}
            onClick={resetPageOrder}
            type="button"
          >
            Reset Order
          </button>
        </div>
      ) : null}

      <div className="merge-actions">
        <button
          disabled={!canReorder}
          onClick={reorderSelectedFile}
          type="button"
        >
          {isReordering ? "Reordering..." : "Reorder Pages"}
        </button>
        <button
          aria-label="Clear Reorder Pages"
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

function pageOrdersMatch(
  left: readonly PageListItem[],
  right: readonly PageListItem[],
): boolean {
  return (
    left.length === right.length &&
    left.every((page, index) => page.pageNumber === right[index]?.pageNumber)
  );
}

function isFileDrop(dataTransfer: DataTransfer): boolean {
  return (
    dataTransfer.files.length > 0 ||
    Array.from(dataTransfer.types).includes("Files")
  );
}
