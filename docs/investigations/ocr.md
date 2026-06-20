# OCR Investigation

**Status:** Preliminary; no engine or release selected.

Investigation does not imply a commitment to ship OCR.

## Why It Is Interesting

Local OCR could make scanned PDFs searchable, support text extraction, improve
accessibility workflows, and enable later search-assisted tools without sending
documents to a remote service.

## Potential User Value

- Extract text from image-only PDFs.
- Create searchable local copies of scanned documents.
- Support review and discovery in large scanned files.
- Provide a foundation for user-reviewed redaction candidates.

## Open Questions

- Which local engine provides acceptable accuracy, bundle size, and maintenance
  cost?
- Should language data be bundled, downloaded on demand, or user supplied?
- Can processing remain responsive for long documents on typical devices?
- How should confidence, reading order, tables, handwriting, and mixed-content
  pages be presented?
- Should OCR output be plain text, a searchable PDF layer, or both?

## Risks and Dependencies

- Large WASM or language assets may slow initial use.
- Accuracy varies by scan quality, layout, language, and typography.
- Incorrect text can mislead downstream search or extraction workflows.
- A searchable PDF layer must preserve page alignment and avoid weakening the
  privacy model.

Before planning a release, compare a small set of local engines against a
representative corpus and define acceptable accuracy, performance, download
size, accessibility, and licensing thresholds.
