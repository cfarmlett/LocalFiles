# Implement the LocalDocs V1 Metadata Removal Workflow

## Context

- LocalDocs is a privacy-first, local-only browser PDF tool.
- Merge PDF, Split PDF, Reorder Pages, Rotate Pages, and Delete Pages are already implemented and hardened.
- The PDF adapter already supports reading metadata through `readMetadata()`.
- This task is product development for Metadata Removal only.
- Do not implement Redaction, compression, ZIP export, OCR, AI, accounts, telemetry, analytics, backend upload paths, or cloud processing.

---

# Core Principles

- All processing must happen locally in the browser.
- No document data may be uploaded, logged, tracked, stored remotely, or sent over the network.
- Preserve existing package boundaries.
- The web app must not import pdf-lib directly.
- PDF implementation details belong in packages/pdf behind the PdfAdapter abstraction.
- Reuse existing workflow, validation, and download patterns wherever practical.

---

# Design Goal

Metadata Removal is a document-level privacy tool.

Unlike Reorder, Rotate, and Delete, this tool operates on document metadata rather than page content.

The user should be able to:

1. Inspect metadata currently present in the document.
2. Remove metadata.
3. Download a cleaned PDF.

The workflow should be simple, transparent, and easy to understand.

---

# Functional Requirements

## 1. Navigation / Page

- Add or complete a Metadata Removal route/page.
- Match existing application structure and styling.

---

## 2. File Selection

- Allow selecting exactly one PDF.
- Support drag-and-drop if consistent with existing tools.
- Display:

  - filename
  - page count

---

## 3. Metadata Inspection

Use the existing adapter metadata-reading capability.

Display available metadata fields when present.

Potential fields include:

- Title
- Author
- Subject
- Keywords
- Creator
- Producer
- Creation Date
- Modification Date

Display only fields that exist.

Documents with no removable metadata are valid inputs.

If no removable metadata is present:

- clearly communicate that no removable metadata was found
- avoid implying an error condition

---

## 4. Metadata Removal

Provide a simple action:

- Remove Metadata

V1 behavior:

- remove all removable metadata fields exposed through the adapter
- generate one cleaned PDF

Success means:

- metadata fields exposed by the adapter are removed from the output PDF
- reading metadata from the generated PDF through the adapter returns empty or absent values for those fields

Do not implement:

- selective field removal
- metadata editing
- metadata replacement
- custom metadata authoring

in this pass.

---

## 5. Content Preservation

Metadata Removal is a metadata-only transformation.

The output PDF must preserve:

- page count
- page order
- page contents
- page rotations

Only metadata should change.

---

## 6. Output Generation

Before adding a new PdfAdapter method:

- inspect the existing adapter surface
- reuse existing capabilities if practical
- add a narrow metadata-removal operation only if it materially improves clarity and maintainability

Requirements:

- Use PdfAdapter.
- Keep metadata manipulation inside packages/pdf.
- Produce one output PDF.
- Produce a deterministic filename.

Examples:

- document-metadata-removed.pdf
- original-name-metadata-removed.pdf

If the underlying PDF library automatically writes fields such as:

- Producer
- Creator

or similar metadata during save, do not claim those fields were removed.

Reflect actual output behavior.

---

## 7. Validation

Handle:

- no file selected
- invalid file
- corrupted PDF
- encrypted/password-protected PDF
- adapter failures

Use clear user-facing error messages.

---

## 8. State Cleanup

Avoid stale:

- metadata display
- outputs
- download links
- errors

when:

- files change
- invalid file selection occurs
- output is regenerated
- PDF load fails

---

## 9. Object URL Lifecycle

Ensure generated output URLs are revoked appropriately.

Avoid memory leaks.

---

## 10. Privacy

Confirm no new:

- fetch calls
- XMLHttpRequest calls
- navigator.sendBeacon usage
- analytics
- telemetry
- external assets
- upload paths
- server processing
- browser storage of document contents

---

# Metadata Scope

V1 should focus on standard PDF document metadata exposed through pdf-lib and the adapter.

Do not attempt:

- forensic scrubbing
- embedded file removal
- annotation removal
- form field removal
- JavaScript removal
- XMP deep inspection
- hidden object analysis
- PDF/A compliance validation

If the underlying library cannot guarantee removal of every possible metadata representation, do not claim otherwise.

The UI and code should accurately represent what is actually removed.

---

# Testing Requirements

## Unit Tests

- metadata extraction
- metadata removal
- output filename generation
- adapter success path
- adapter error path
- documents with no metadata

## Workflow / Component Tests

- file selection
- metadata display
- no-metadata display
- metadata removal
- output generation
- stale-state cleanup

## E2E Tests

- upload/select PDF
- display metadata
- generate cleaned PDF
- download output
- verify downloaded bytes begin with %PDF-
- verify no-external-requests assertion still passes

---

# Implementation Notes

- Be conservative with privacy claims.
- Do not imply complete forensic sanitization.
- Display exactly what is being removed.
- Keep the workflow simple.
- Favor claim accuracy over marketing language.

---

# Validation

Run and fix issues from:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e
- pnpm build

---

# Output

1. Summary of changes.
2. Architecture decisions.
3. Files modified.
4. Validation results.
5. Known limitations.
6. Recommended hardening follow-up.
