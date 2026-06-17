# Implement the LocalDocs V1 Rotate Pages Workflow

## Context

- LocalDocs is a privacy-first, local-only browser PDF tool.
- Merge PDF, Split PDF, and Reorder Pages are already implemented.
- This task is product development for Rotate Pages only.
- Do not implement Delete Pages, Extract Pages, compression, ZIP export, OCR, AI, accounts, telemetry, analytics, backend upload paths, or cloud processing.

## Core Principles

- All processing must happen locally in the browser.
- No document data may be uploaded, logged, tracked, stored remotely, or sent over the network.
- Preserve existing package boundaries.
- The web app must not import pdf-lib directly.
- PDF implementation details belong in packages/pdf behind the PdfAdapter abstraction.
- Reuse existing workflow, validation, page-list, and download patterns wherever practical.

---

# Design Goal

Rotate Pages should prove that the page-list pattern established by Reorder Pages is reusable.

Favor:

- reuse of page-list state
- reuse of page-row UI
- reuse of output lifecycle management
- consistency with Reorder Pages

Avoid:

- broad refactors
- speculative abstractions
- new dependencies

---

# Feature Definition

Rotate Pages means:

"Take one input PDF and produce one output PDF where selected pages have modified rotation."

Pages must remain in their original order.

Only page rotation should change.

Do not:

- duplicate pages
- omit pages
- reorder pages
- rasterize pages
- alter page contents

except as necessary to update page rotation.

---

# Functional Requirements

## 1. Navigation / Page

- Add or complete a Rotate Pages route/page.
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
- working rotation state

Page numbers must remain 1-based.

Existing page rotation handling:

- If existing page rotation can be read through the adapter cleanly, initialize from actual page rotation.
- Otherwise initialize to 0° and clearly document the limitation.

Do not introduce significant complexity solely to support existing page rotation detection.

---

## 4. Rotation Controls

Provide:

- Rotate Left (-90°)
- Rotate Right (+90°)

Controls should operate on individual pages.

Do not implement:

- Rotate All
- batch rotation
- multi-page selection

in this pass.

Rotation should cycle correctly:

- 0°
- 90°
- 180°
- 270°
- back to 0°

Negative rotations should normalize correctly.

Final rotations should normalize to:

- 0°
- 90°
- 180°
- 270°

---

## 5. Output Generation

Before adding a new PdfAdapter method:

- Inspect the existing adapter surface.
- Reuse existing capabilities if practical.
- Add a narrow rotate operation only if it materially improves clarity and maintainability.

Requirements:

- Use PdfAdapter.
- Keep PDF manipulation inside packages/pdf.
- Produce one output PDF.
- Produce a deterministic output filename.

Examples:

- document-rotated.pdf
- original-name-rotated.pdf

---

## 6. Validation

Handle:

- no file selected
- invalid file
- corrupted PDF
- encrypted/password-protected PDF
- adapter failures

Use clear user-facing error messages.

---

## 7. State Cleanup

Avoid stale:

- rotation state
- outputs
- download links
- errors

when:

- files change
- invalid file selection occurs
- output is regenerated
- PDF load fails

---

## 8. Object URL Lifecycle

Ensure generated output URLs are revoked appropriately.

Avoid memory leaks.

---

## 9. Privacy

Confirm no new:

- fetch calls
- XMLHttpRequest calls
- navigator.sendBeacon usage
- analytics
- telemetry
- external assets
- upload paths
- server processing

---

# Testing Requirements

## Unit Tests

- rotate left
- rotate right
- rotation wraparound
- rotation normalization
- output filename generation
- adapter success path
- adapter error path

## Workflow / Component Tests

- file selection
- page count display
- rotation display
- rotate left
- rotate right
- output generation
- stale-state cleanup

## E2E Tests

- upload/select PDF
- rotate at least one page
- generate output PDF
- download output
- verify downloaded bytes begin with %PDF-
- verify no-external-requests assertion still passes

---

# Implementation Notes

- Reuse Reorder Pages patterns wherever practical.
- Do not implement thumbnails.
- Do not implement previews.
- Do not implement drag-and-drop page reordering.
- Do not implement Rotate All.
- Do not implement Delete Pages or Extract Pages.
- Keep implementation simple enough to serve as the reusable page-action pattern for future tools.

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
