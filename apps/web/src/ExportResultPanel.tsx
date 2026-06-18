import { useEffect, useMemo, useState } from "react";

import { CollapsibleSection } from "./CollapsibleSection";
import type { DownloadableExportResult } from "./exportResults";

export type ExportResultPanelProps = Readonly<{
  results: readonly DownloadableExportResult[];
  primaryAction?: Readonly<{
    description: string;
    isBusy?: boolean;
    label: string;
    onClick: () => void;
  }>;
}>;

export function ExportResultPanel({
  primaryAction,
  results,
}: ExportResultPanelProps) {
  const resultListSignature = useMemo(
    () => results.map((result) => `${result.id}:${result.url}`).join("|"),
    [results],
  );
  const [resultListState, setResultListState] = useState({
    isExpanded: true,
    signature: resultListSignature,
  });

  useEffect(() => {
    if (results.length === 0) {
      setResultListState({
        isExpanded: true,
        signature: resultListSignature,
      });
    }
  }, [resultListSignature, results.length]);

  if (results.length === 0) {
    return null;
  }

  const multipleResults = results.length > 1;
  const statusText = multipleResults ? "PDFs Generated" : "PDF Generated";
  const isResultListExpanded =
    resultListState.signature === resultListSignature
      ? resultListState.isExpanded
      : true;
  const resultList = (
    <ol className="export-result-list">
      {results.map((result) => (
        <li className="export-result-list__item" key={result.id}>
          <div>
            <strong>{result.filename}</strong>
            {result.detail === undefined ? null : <span>{result.detail}</span>}
          </div>
          <div className="export-result-actions">
            <a
              aria-label={
                multipleResults ? `Download ${result.filename}` : undefined
              }
              download={result.filename}
              href={result.url}
            >
              {multipleResults ? "Download" : "Download PDF"}
            </a>
            {result.mimeType === "application/pdf" ? (
              <a
                aria-label={
                  multipleResults ? `Open ${result.filename}` : undefined
                }
                href={result.url}
                rel="noreferrer"
                target="_blank"
              >
                Open PDF
              </a>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );

  return (
    <section
      aria-label="Export result"
      aria-live="polite"
      className="export-result-panel"
    >
      <div>
        <h3>{statusText}</h3>
        <p>
          {multipleResults
            ? `${results.length} files are ready to download.`
            : "Your file is ready to download."}
        </p>
      </div>

      {primaryAction === undefined ? null : (
        <div className="export-result-primary-action">
          <button
            aria-busy={primaryAction.isBusy === true}
            disabled={primaryAction.isBusy === true}
            onClick={primaryAction.onClick}
            type="button"
          >
            {primaryAction.isBusy === true
              ? "Preparing ZIP..."
              : primaryAction.label}
          </button>
          <p>{primaryAction.description}</p>
        </div>
      )}

      {multipleResults ? (
        <CollapsibleSection
          isOpen={isResultListExpanded}
          onToggle={(isExpanded) =>
            setResultListState({
              isExpanded,
              signature: resultListSignature,
            })
          }
          title={`Generated Files (${results.length})`}
        >
          {resultList}
        </CollapsibleSection>
      ) : (
        resultList
      )}
    </section>
  );
}
