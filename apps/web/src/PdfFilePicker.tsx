import { useRef, useState, type RefObject } from "react";

export type PdfFilePickerProps = Readonly<{
  errors: readonly string[];
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  instructions?: string;
  multiple?: boolean;
  onFilesSelected: (files: FileList) => void;
  selectionSummary: string;
}>;

export function PdfFilePicker({
  errors,
  inputId,
  inputRef,
  instructions,
  multiple = false,
  onFilesSelected,
  selectionSummary,
}: PdfFilePickerProps) {
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileDragDepth = useRef(0);
  const title = multiple
    ? "Choose PDFs or drop them here"
    : "Choose one PDF or drop it here";
  const defaultInstructions = multiple
    ? "Only PDF files are accepted. Processing stays on this device."
    : "Only one PDF is accepted. Processing stays on this device.";
  const titleId = `${inputId}-label`;
  const instructionsId = `${inputId}-instructions`;

  function resetFileDragState() {
    fileDragDepth.current = 0;
    setIsDraggingFile(false);
  }

  return (
    <>
      <label
        className={`drop-zone${
          isDraggingFile ? " drop-zone--drag-active" : ""
        }`}
        htmlFor={inputId}
        onDragEnter={(event) => {
          if (!isFileDrop(event.dataTransfer)) {
            return;
          }

          event.preventDefault();
          fileDragDepth.current += 1;
          setIsDraggingFile(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          fileDragDepth.current = Math.max(0, fileDragDepth.current - 1);

          if (fileDragDepth.current === 0) {
            setIsDraggingFile(false);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = isFileDrop(event.dataTransfer)
            ? "copy"
            : "none";
        }}
        onDrop={(event) => {
          event.preventDefault();
          const isPdfFileDrop = isFileDrop(event.dataTransfer);

          resetFileDragState();

          if (isPdfFileDrop) {
            onFilesSelected(event.dataTransfer.files);
          }
        }}
      >
        <span className="drop-zone__title" id={titleId}>
          {title}
        </span>
        <span className="drop-zone__copy" id={instructionsId}>
          {instructions ?? defaultInstructions}
        </span>
        <span aria-hidden="true" className="drop-zone__action">
          {multiple ? "Choose PDFs" : "Choose PDF"}
        </span>
        <input
          accept="application/pdf,.pdf"
          aria-describedby={instructionsId}
          aria-labelledby={titleId}
          className="visually-hidden"
          id={inputId}
          multiple={multiple}
          onChange={(event) => {
            if (event.currentTarget.files !== null) {
              onFilesSelected(event.currentTarget.files);
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
        {selectionSummary}
      </div>
    </>
  );
}

function isFileDrop(dataTransfer: DataTransfer): boolean {
  return (
    dataTransfer.files.length > 0 ||
    Array.from(dataTransfer.types).includes("Files")
  );
}
