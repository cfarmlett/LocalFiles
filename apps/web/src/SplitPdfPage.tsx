import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localfiles/pdf";

import { createAsyncOperationTracker } from "./asyncOperationToken";
import { ExportResultPanel } from "./ExportResultPanel";
import { useExportResultUrls, type ExportResult } from "./exportResults";
import { validatePdfFile } from "./mergeWorkflow";
import {
  buildSplitFileItem,
  getSplitErrorMessage,
  splitFile,
  type SplitFileItem,
  type SplitMode,
  type SplitOutput,
} from "./splitWorkflow";
import {
  createSplitZipEntries,
  createSplitZipFilename,
  createZipArchive,
} from "./splitZip";

export type SplitPdfPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function SplitPdfPage({ adapter = defaultAdapter }: SplitPdfPageProps) {
  const [file, setFile] = useState<SplitFileItem>();
  const [mode, setMode] = useState<SplitMode>("interval");
  const [interval, setInterval] = useState("1");
  const [customRanges, setCustomRanges] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [outputs, setOutputs] = useState<readonly SplitOutput[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileOperations = useRef(createAsyncOperationTracker());
  const splitOperations = useRef(createAsyncOperationTracker());
  const zipOperations = useRef(createAsyncOperationTracker());

  const canSplit = file !== undefined && !isReading && !isSplitting;
  const canClear =
    file !== undefined ||
    mode !== "interval" ||
    interval !== "1" ||
    customRanges !== "" ||
    errors.length > 0 ||
    isReading ||
    isSplitting ||
    outputs.length > 0;
  const exportResults = useMemo(
    () =>
      outputs.map<ExportResult>((output) => ({
        id: output.filename,
        filename: output.filename,
        bytes: output.bytes,
        mimeType: "application/pdf",
        detail: `Pages ${output.range.start}${
          output.range.end === output.range.start ? "" : `-${output.range.end}`
        }`,
      })),
    [outputs],
  );
  const downloadableResults = useExportResultUrls(exportResults);
  const canDownloadZip =
    file !== undefined &&
    outputs.length > 1 &&
    !isReading &&
    !isSplitting &&
    !isCreatingZip;
  const intervalModeLabel = `Split every ${
    interval === "" ? "—" : interval
  } ${Number(interval) === 1 ? "page" : "pages"}`;

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
    const operationToken = fileOperations.current.begin();
    const selected = Array.from(selectedFiles);

    invalidateSplitOperation();
    clearOutputs();

    if (selected.length === 0) {
      setFile(undefined);
      setErrors(["Choose one PDF before splitting."]);
      return;
    }

    if (selected.length > 1) {
      setFile(undefined);
      setErrors(["Choose exactly one PDF before splitting."]);
      return;
    }

    const selectedFile = selected[0];
    const validation = validatePdfFile(selectedFile);

    if (!validation.valid) {
      setFile(undefined);
      setErrors([validation.message]);
      resetInput();
      return;
    }

    setIsReading(true);
    setFile(undefined);
    setErrors([]);

    try {
      const nextFile = await buildSplitFileItem(selectedFile, adapter, () =>
        crypto.randomUUID(),
      );

      if (fileOperations.current.isCurrent(operationToken)) {
        setFile(nextFile);
      }
    } catch (error) {
      if (fileOperations.current.isCurrent(operationToken)) {
        setFile(undefined);
        setErrors([`${selectedFile.name}: ${getSplitErrorMessage(error)}`]);
      }
    } finally {
      if (fileOperations.current.isCurrent(operationToken)) {
        setIsReading(false);
        resetInput();
      }
    }
  }

  async function splitSelectedFile() {
    const operationToken = splitOperations.current.begin();

    clearOutputs();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before splitting."]);
      return;
    }

    setIsSplitting(true);

    try {
      const nextOutputs = await splitFile(file, adapter, mode, {
        interval: Number(interval),
        customRanges,
      });

      if (splitOperations.current.isCurrent(operationToken)) {
        setOutputs(nextOutputs);
      }
    } catch (error) {
      if (splitOperations.current.isCurrent(operationToken)) {
        setErrors([getSplitErrorMessage(error)]);
      }
    } finally {
      if (splitOperations.current.isCurrent(operationToken)) {
        setIsSplitting(false);
      }
    }
  }

  function changeMode(nextMode: SplitMode) {
    invalidateSplitOperation();
    zipOperations.current.invalidate();
    setMode(nextMode);
    setErrors([]);
    clearOutputs();
  }

  function activateIntervalMode() {
    if (mode !== "interval") {
      changeMode("interval");
    }
  }

  function invalidateSplitOperation() {
    splitOperations.current.invalidate();
    setIsSplitting(false);
  }

  function clearOutputs() {
    zipOperations.current.invalidate();
    setOutputs([]);
    setIsCreatingZip(false);
  }

  function clearWorkflow() {
    fileOperations.current.invalidate();
    invalidateSplitOperation();
    zipOperations.current.invalidate();
    setFile(undefined);
    setMode("interval");
    setInterval("1");
    setCustomRanges("");
    setErrors([]);
    setIsReading(false);
    setIsCreatingZip(false);
    clearOutputs();
    resetInput();
  }

  async function downloadZip() {
    if (!canDownloadZip) {
      return;
    }

    const operationToken = zipOperations.current.begin();
    let objectUrl: string | undefined;
    setIsCreatingZip(true);
    setErrors([]);

    try {
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });

      if (!zipOperations.current.isCurrent(operationToken)) {
        return;
      }

      const zipBytes = createZipArchive(createSplitZipEntries(outputs));
      const bytes = new ArrayBuffer(zipBytes.byteLength);
      new Uint8Array(bytes).set(zipBytes);
      objectUrl = URL.createObjectURL(
        new Blob([bytes], { type: "application/zip" }),
      );
      const link = document.createElement("a");

      if (!zipOperations.current.isCurrent(operationToken)) {
        return;
      }

      link.href = objectUrl;
      link.download = createSplitZipFilename(file.file.name);
      link.click();
    } catch (error) {
      if (zipOperations.current.isCurrent(operationToken)) {
        setErrors([
          error instanceof Error
            ? error.message
            : "The ZIP file could not be prepared.",
        ]);
      }
    } finally {
      if (objectUrl !== undefined) {
        const urlToRevoke = objectUrl;

        window.setTimeout(() => URL.revokeObjectURL(urlToRevoke), 0);
      }

      if (zipOperations.current.isCurrent(operationToken)) {
        setIsCreatingZip(false);
      }
    }
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
          Select one PDF, choose how to split its pages, then generate separate
          PDF files locally in your browser. Files are not uploaded.
        </p>
      </div>

      <label
        className="drop-zone"
        htmlFor="split-file-input"
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
          id="split-file-input"
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

      <fieldset className="split-options">
        <legend>Split mode</legend>
        <div className="split-interval-option">
          <input
            aria-label={intervalModeLabel}
            checked={mode === "interval"}
            id="split-mode-interval"
            name="split-mode"
            onChange={() => changeMode("interval")}
            type="radio"
          />
          <label htmlFor="split-mode-interval">Split every</label>
          <input
            aria-describedby="split-interval-unit"
            aria-label="Pages per split PDF"
            id="split-interval"
            min="1"
            onChange={(event) => {
              invalidateSplitOperation();
              setInterval(event.currentTarget.value);
              setErrors([]);
              clearOutputs();
            }}
            onFocus={activateIntervalMode}
            step="1"
            tabIndex={mode === "interval" ? 0 : -1}
            type="number"
            value={interval}
          />
          <span aria-live="polite" id="split-interval-unit">
            {Number(interval) === 1 ? "page" : "pages"}
          </span>
        </div>
        <label>
          <input
            checked={mode === "custom-ranges"}
            name="split-mode"
            onChange={() => changeMode("custom-ranges")}
            type="radio"
          />
          Custom Ranges
        </label>
      </fieldset>

      {mode === "custom-ranges" ? (
        <label className="field-row">
          Page ranges
          <textarea
            aria-describedby="split-ranges-help"
            onChange={(event) => {
              invalidateSplitOperation();
              setCustomRanges(event.currentTarget.value);
              setErrors([]);
              clearOutputs();
            }}
            rows={4}
            value={customRanges}
          />
          <span className="field-help" id="split-ranges-help">
            Enter one range per output PDF, separated by commas or new lines.
          </span>
        </label>
      ) : null}

      <div className="merge-actions">
        <button disabled={!canSplit} onClick={splitSelectedFile} type="button">
          {isSplitting ? "Splitting..." : "Split PDF"}
        </button>
        <button
          aria-label="Clear Split PDF"
          disabled={!canClear}
          onClick={clearWorkflow}
          type="button"
        >
          Clear
        </button>
      </div>

      <ExportResultPanel
        primaryAction={
          outputs.length > 1
            ? {
                busyLabel: "Preparing ZIP...",
                description:
                  "Download all generated split PDFs together as one ZIP file.",
                isBusy: isCreatingZip,
                label: "Download ZIP",
                onClick: () => {
                  void downloadZip();
                },
              }
            : undefined
        }
        results={downloadableResults}
      />

      {isReading ? (
        <p aria-live="polite" className="loading-note">
          Reading PDF locally...
        </p>
      ) : null}
    </div>
  );
}
