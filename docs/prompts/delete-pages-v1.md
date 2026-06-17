# Implement the LocalDocs V1 Delete Pages Workflow

## Context

- LocalDocs is a privacy-first, local-only browser PDF tool.
- Merge PDF, Split PDF, Reorder Pages, and Rotate Pages are already implemented.
- This task is product development for Delete Pages only.
- Do not implement Extract Pages, compression, ZIP export, OCR, AI, accounts, telemetry, analytics, backend upload paths, or cloud processing.

## Core Principles

- All processing must happen locally in the browser.
- No document data may be uploaded, logged, tracked, stored remotely, or sent over the network.
- Preserve existing package boundaries.
- The web app must not import pdf-lib directly.
- PDF implementation details belong in packages/pdf behind the PdfAdapter abstraction.
- Reuse existing workflow, validation, page-list, and download patterns wherever practical.

---

# Design Goal

Delete Pages should reuse the page-list pattern established by Reorder Pages and reused by Rotate Pages.

Favor:

- reuse of page-list state
- reuse of page-row UI
- reuse of output lifecycle management
- consistency with Reorder/Rotate Pages

Avoid:

- broad refactors
- speculative abstractions
- new dependencies

---

# Feature Definition

Delete Pages means:

"Take one input PDF and produce one output PDF with selected pages removed."

The generated PDF must:

- preserve the original order of remaining pages
- preserve the original page contents
- include each remaining page exactly once
- omit only pages explicitly marked for deletion
- never rasterize pages

Remaining pages must appear in the same relative order as the source document.

---

# Functional Requirements

## 1. Navigation / Page

- Add or complete a Delete Pages route/page.
- Match the existing application structure and styling.

---

## 2. File Selection

- Allow selecting exactly one PDF.
- Support drag-and-drop if consistent with existing tools.
- Display:

  - filename
  - page count

---

## 3. Page List

Display pages using the established page-list pattern.

Each row should clearly identify:

- page number
- whether the page is marked for deletion

Page numbers must remain 1-based.

The UI should continue displaying original page numbers even after pages are marked for deletion.

Page numbers are identifiers, not positions in the future output document.

Output PDFs naturally contain a reduced page count.

The UI should preserve original page identifiers during editing, while generated output PDFs should behave as normal PDFs.

---

## 4. Delete Controls

Provide a simple control per page:

- Delete
- Restore

V1 behavior:

- Pages are not removed from the visible list immediately.
- Marked pages remain visible with a clear deleted/selected state.
- Users can restore a marked page before generating the output.

Do not implement:

- page thumbnails
- previews
- drag-and-drop
- multi-page selection
- select all
- delete all
- range delete

in this pass.

---

## 5. Delete-All Guard

The workflow must prevent generating a zero-page PDF.

If the user marks every page for deletion:

- output generation must not proceed
- the UI must clearly communicate why generation is blocked

A valid output must contain at least one page.

---

## 6. Output Generation

Before adding a new PdfAdapter method:

- Inspect the existing adapter surface.
- Reuse existing capabilities if practical.
- Add a narrow delete/remove operation only if it materially improves clarity and maintainability.

Requirements:

- Use PdfAdapter.
- Keep PDF manipulation inside packages/pdf.
- Produce one output PDF.
- Produce a deterministic output filename.

Examples:

- document-pages-deleted.pdf
- original-name-pages-deleted.pdf

---

## 7. Validation

Handle:

- no file selected
- invalid file
- corrupted PDF
- encrypted/password-protected PDF
- all pages selected for deletion
- adapter failures

Use clear user-facing error messages.

---

## 8. State Cleanup

Avoid stale:

- deletion state
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

# Testing Requirements

## Unit Tests

- default delete state
- mark page for deletion
- restore page
- preserve remaining page order
- prevent deleting all pages
- output filename generation
- adapter success path
- adapter error path

## Workflow / Component Tests

- file selection
- page count display
- deletion state display
- delete/restore behavior
- delete-all guard
- output generation
- stale-state cleanup

## E2E Tests

- upload/select PDF
- mark at least one page for deletion
- generate output PDF
- download output
- verify downloaded bytes begin with %PDF-
- verify no-external-requests assertion still passes
- cover delete-all guard if practical

---

# Implementation Notes

- Reuse Reorder/Rotate Pages patterns wherever practical.
- Do not implement thumbnails.
- Do not implement previews.
- Do not implement drag-and-drop.
- Do not implement select all, delete all, or range delete.
- Do not implement Extract Pages.
- Keep implementation simple enough to serve as another page-action workflow pattern.

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
