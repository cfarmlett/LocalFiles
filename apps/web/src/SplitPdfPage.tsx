import { useMemo, useRef, useState } from "react";

import { LocalPdfAdapter, type PdfAdapter } from "@localdocs/pdf";

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

export type SplitPdfPageProps = Readonly<{
  adapter?: PdfAdapter;
}>;

const defaultAdapter = new LocalPdfAdapter();

export function SplitPdfPage({ adapter = defaultAdapter }: SplitPdfPageProps) {
  const [file, setFile] = useState<SplitFileItem>();
  const [mode, setMode] = useState<SplitMode>("every-page");
  const [chunkSize, setChunkSize] = useState("1");
  const [customRanges, setCustomRanges] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);
  const [outputs, setOutputs] = useState<readonly SplitOutput[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSplit = file !== undefined && !isReading && !isSplitting;
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

  async function selectFiles(selectedFiles: FileList | readonly File[]) {
    const selected = Array.from(selectedFiles);

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
      setFile(
        await buildSplitFileItem(selectedFile, adapter, () =>
          crypto.randomUUID(),
        ),
      );
    } catch (error) {
      setFile(undefined);
      setErrors([`${selectedFile.name}: ${getSplitErrorMessage(error)}`]);
    } finally {
      setIsReading(false);
      resetInput();
    }
  }

  async function splitSelectedFile() {
    clearOutputs();
    setErrors([]);

    if (file === undefined) {
      setErrors(["Choose one PDF before splitting."]);
      return;
    }

    setIsSplitting(true);

    try {
      const nextOutputs = await splitFile(file, adapter, mode, {
        chunkSize: Number(chunkSize),
        customRanges,
      });

      setOutputs(nextOutputs);
    } catch (error) {
      setErrors([getSplitErrorMessage(error)]);
    } finally {
      setIsSplitting(false);
    }
  }

  function changeMode(nextMode: SplitMode) {
    setMode(nextMode);
    setErrors([]);
    clearOutputs();
  }

  function clearOutputs() {
    setOutputs([]);
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
        <label>
          <input
            checked={mode === "every-page"}
            name="split-mode"
            onChange={() => changeMode("every-page")}
            type="radio"
          />
          Every Page
        </label>
        <label>
          <input
            checked={mode === "every-n-pages"}
            name="split-mode"
            onChange={() => changeMode("every-n-pages")}
            type="radio"
          />
          Every N Pages
        </label>
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

      {mode === "every-n-pages" ? (
        <label className="field-row">
          Pages per file
          <input
            min="1"
            onChange={(event) => {
              setChunkSize(event.currentTarget.value);
              setErrors([]);
              clearOutputs();
            }}
            step="1"
            type="number"
            value={chunkSize}
          />
        </label>
      ) : null}

      {mode === "custom-ranges" ? (
        <label className="field-row">
          Page ranges
          <textarea
            aria-describedby="split-ranges-help"
            onChange={(event) => {
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
