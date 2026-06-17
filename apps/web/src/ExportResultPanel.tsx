import type { DownloadableExportResult } from "./exportResults";

export type ExportResultPanelProps = Readonly<{
  results: readonly DownloadableExportResult[];
}>;

export function ExportResultPanel({ results }: ExportResultPanelProps) {
  if (results.length === 0) {
    return null;
  }

  const multipleResults = results.length > 1;
  const statusText = multipleResults ? "PDFs Generated" : "PDF Generated";

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

      <ol className="export-result-list">
        {results.map((result) => (
          <li className="export-result-list__item" key={result.id}>
            <div>
              <strong>{result.filename}</strong>
              {result.detail === undefined ? null : (
                <span>{result.detail}</span>
              )}
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
    </section>
  );
}
