import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

import { validatePdfFile } from "./mergeWorkflow";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import {
  allPagesDeleted,
  buildDeleteFileItem,
  createDefaultDeletePages,
  deletePagesFile,
  getDeleteErrorMessage,
  markPageDeleted,
  restorePage,
  type DeleteFileItem,
  type DeletePageItem,
  type DeleteResult,
} from "./deleteWorkflow";

export type DeletePagesPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function DeletePagesPage({
  adapter = defaultAdapter,
}: DeletePagesPageProps) {
  const [file, setFile] = useState<DeleteFileItem>();
  const [pages, setPages] = useState<readonly DeletePageItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState<DeleteResult>();
  const inputRef = useRef<HTMLInputElement>(null);

  const hasDeletedPages = pages.some((page) => page.deleted);
  const isDeleteAllBlocked = allPagesDeleted(pages);
  const canDelete =
    file !== undefined &&
    hasDeletedPages &&
    !isDeleteAllBlocked &&
    !isReading &&
    !isDeleting;
  const exportResults = useMemo<readonly ExportResult[]>(
    () =>
      deleteResult === undefined
        ? []
        : [
            {
              id: deleteResult.filename,
              filename: deleteResult.filename,
              bytes: deleteResult.bytes,
              mimeType: "application/pdf",
            },
          ],
    [deleteResult],
  );
  const downloadableResults = useExportResultUrls(exportResults);

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
    const selected = Array.from(selectedFiles);

    clearOutput();

    if (selected.length === 0) {
      clearSelection();
      setErrors(["Choose one PDF before deleting pages."]);
      return;
    }

    if (selected.length > 1) {
      clearSelection();
      setErrors(["Choose exactly one PDF before deleting pages."]);
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
      const nextFile = await buildDeleteFileItem(selectedFile, adapter, () =>
        crypto.randomUUID(),
      );
      setFile(nextFile);
      setPages(createDefaultDeletePages(nextFile.metadata.pageCount));
    } catch (error) {
      clearSelection();
      setErrors([`${selectedFile.name}: ${getDeleteErrorMessage(error)}`]);
    } finally {
      setIsReading(false);
      resetInput();
    }
  }

  async function deleteSelectedPages() {
    clearOutput();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before deleting pages."]);
      return;
    }

    setIsDeleting(true);

    try {
      setDeleteResult(await deletePagesFile(file, adapter, pages));
    } catch (error) {
      setErrors([getDeleteErrorMessage(error)]);
    } finally {
      setIsDeleting(false);
    }
  }

  function markSelectedPageDeleted(pageId: string) {
    setPages((currentPages) => markPageDeleted(currentPages, pageId));
    setErrors([]);
    clearOutput();
  }

  function restoreSelectedPage(pageId: string) {
    setPages((currentPages) => restorePage(currentPages, pageId));
    setErrors([]);
    clearOutput();
  }

  function clearSelection() {
    setFile(undefined);
    setPages([]);
  }

  function clearOutput() {
    setDeleteResult(undefined);
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
          Select one PDF, mark pages for deletion, then generate a copy with
          those pages removed locally in your browser. Files are not uploaded.
        </p>
      </div>

      <label
        className="drop-zone"
        htmlFor="delete-file-input"
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
          id="delete-file-input"
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

      {isDeleteAllBlocked ? (
        <div aria-live="polite" className="error-list" role="alert">
          <p>Restore at least one page before generating a PDF.</p>
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
        <ol className="file-list" aria-label="Pages with deletion settings">
          {pages.map((page) => (
            <li className="file-list__item" key={page.id}>
              <div>
                <strong>Page {page.pageNumber}</strong>
                <span>
                  {page.deleted ? "Marked for deletion" : "Kept in output"}
                </span>
              </div>
              <div className="file-actions">
                {page.deleted ? (
                  <button
                    aria-label={`Restore page ${page.pageNumber}`}
                    onClick={() => restoreSelectedPage(page.id)}
                    type="button"
                  >
                    Restore
                  </button>
                ) : (
                  <button
                    aria-label={`Delete page ${page.pageNumber}`}
                    onClick={() => markSelectedPageDeleted(page.id)}
                    type="button"
                  >
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="merge-actions">
        <button
          disabled={!canDelete}
          onClick={deleteSelectedPages}
          type="button"
        >
          {isDeleting ? "Deleting..." : "Delete Pages"}
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
