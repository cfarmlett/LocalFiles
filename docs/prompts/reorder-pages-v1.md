Implement the LocalDocs V1 Reorder Pages workflow.

Context:
- LocalDocs is a privacy-first, local-only browser PDF tool.
- Merge PDF and Split PDF are already implemented and should be treated as implementation patterns.
- This task is product development for Reorder Pages only.
- Do not implement Rotate Pages, Delete Pages, Extract Pages, compression, ZIP export, OCR, AI, accounts, telemetry, analytics, backend upload paths, or cloud processing.

Core principles:
- All processing must happen locally in the browser.
- No document data may be uploaded, logged, tracked, stored remotely, or sent over the network.
- Preserve existing package boundaries.
- The web app must not import pdf-lib directly.
- PDF implementation details belong in packages/pdf behind the PdfAdapter abstraction.
- Reuse existing workflow, validation, error-handling, and download patterns where practical.

Design goal:

The Reorder Pages implementation should establish the reusable page-list workflow pattern for future page-based tools.

Future tools expected to reuse this pattern:

- Rotate Pages
- Delete Pages
- Extract Pages (future)

Favor:

- reusable page-list state management
- reusable page-order handling
- reusable page-action controls
- consistency with existing Merge PDF and Split PDF workflows

Avoid:

- broad refactors
- speculative abstractions
- feature creep
- unnecessary dependencies

The page-list representation should be designed so future tools can attach actions to pages.

Examples:

Reorder Pages:
- Move Up
- Move Down

Rotate Pages:
- Rotate Left
- Rotate Right

Delete Pages:
- Delete

Do not build those future features now, but avoid creating a design that will fight them later.

Feature definition:

Reorder Pages means:

"Take one input PDF and produce one new PDF with the same pages in a user-specified order."

Page-order integrity requirement:

The generated PDF must contain:

- every page from the original document
- exactly once
- in the user-selected order

No pages may be duplicated or omitted.

Functional requirements:

1. Navigation / Page

- Add or complete a Reorder Pages route/page.
- Match the existing application structure and styling.
- Keep the workflow simple and maintainable.

2. File Selection

- Allow selecting exactly one PDF file.
- Support drag-and-drop if consistent with existing Merge/Split behavior.
- Reject invalid files gracefully.
- Reuse the existing page-count loading approach where practical.
- Display:
  - filename
  - page count

3. Page Order Representation

- After loading the PDF, represent pages as an ordered list from 1 to N.
- The default order should match the original document:
  - 1, 2, 3, ..., N

4. Reordering Controls

Provide a simple, accessible way to reorder pages.

V1 behavior:

- Show each page as a row/card.
- Display page number clearly.
- Provide:
  - Move Up
  - Move Down

Do not:

- add drag-and-drop dependencies
- implement drag-and-drop reordering
- implement page thumbnails
- implement page previews

Correctness, simplicity, and accessibility are more important than visual polish.

Large documents:

- The page list may contain hundreds of pages.
- This is acceptable for V1.
- Do not introduce virtualization, pagination, thumbnails, previews, or other complexity in this implementation.

Page numbers alone are sufficient for V1.

5. Output Operation

Before adding a new PdfAdapter method:

- Inspect the existing adapter surface.
- Reuse existing page-selection or page-copying capabilities if practical.
- Only add a new adapter operation if it materially improves clarity or maintainability.

Requirements:

- Use the PdfAdapter boundary.
- Keep actual PDF page manipulation inside packages/pdf.
- Do not bypass adapter boundaries.
- Generate one downloadable reordered PDF.

Output filename should be deterministic and user-friendly.

Examples:

- reordered-document.pdf
- original-name-reordered.pdf

6. Validation

Validate and display clear user-facing errors for:

- no file selected
- invalid file
- corrupted PDF
- encrypted/password-protected PDF
- adapter failures

Error messages should be sanitized and user-friendly.

Page-order integrity:

- Verify page-order integrity before PDF generation.
- The workflow should maintain a valid permutation of the original pages.
- Users should not be able to create duplicate or missing pages through the UI.

7. State Cleanup

Avoid stale UI states when:

- file changes
- invalid file selection occurs
- page order changes
- reorder operation is rerun
- output is replaced
- errors occur

Changing page order should clear stale outputs and stale errors where appropriate.

8. Object URL Lifecycle

- Ensure generated download URLs are revoked appropriately.
- Avoid memory leaks when:
  - output is replaced
  - file changes
  - page order changes
  - page unmounts

9. Privacy

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

Testing requirements:

Unit tests:

- default page order generation
- move page up
- move page down
- page-order integrity verification
- output filename generation
- adapter reorder success path
- adapter reorder error path

Workflow/component tests:

- file selection
- invalid file handling
- page count display
- page order display
- move up/down behavior
- reorder action state transitions
- output generation
- stale output cleanup
- stale error cleanup

E2E tests:

- upload/select a valid PDF
- reorder pages using Move Up / Move Down controls
- generate reordered PDF
- download result
- verify downloaded bytes begin with %PDF-
- verify no-external-requests assertion still passes
- cover at least one invalid-file or error path if practical

Implementation notes:

- Reuse Merge PDF and Split PDF patterns where appropriate.
- Reuse existing page-range and validation infrastructure wherever practical.
- Do not perform broad architectural refactors.
- Do not add heavy dependencies.
- Do not implement thumbnails.
- Do not implement previews.
- Do not implement drag-and-drop.
- Do not implement Rotate Pages, Delete Pages, or Extract Pages in this task.
- Keep the implementation simple enough to become the reusable page-list pattern for future tools.

Validation:

Run and fix issues from:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e
- pnpm build

Output:

1. Summary of changes.
2. Architecture decisions.
3. Files modified.
4. Validation results.
5. Known limitations.
6. Recommended hardening/review follow-up.

Important:

- Keep this focused on a production-quality Reorder Pages feature.
- Follow the established LocalDocs architecture.
- Reuse existing infrastructure wherever practical.
- Prefer proven patterns over new abstractions.
- If a requested change requires significant refactoring, stop and explain rather than proceeding.