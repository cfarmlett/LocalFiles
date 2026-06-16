Implement the LocalDocs V1 Split PDF workflow.

Context:

- LocalDocs is a privacy-first, local-only browser PDF tool.
- Merge PDF is already implemented and should be treated as the implementation pattern.
- CI, testing, TypeScript separation, and repository hygiene are already in place.
- This task is product development for Split PDF only.
- Do not implement Extract Pages yet.
- Do not implement compression, PDF-to-images, text extraction, OCR, AI, accounts, subscriptions, telemetry, analytics, backend upload paths, cloud processing, or any V1.5 features.

Core principles:

- All processing must happen locally in the browser.
- No document data may be uploaded, logged, tracked, stored remotely, or sent over the network.
- Preserve existing package boundaries.
- The web app must not import pdf-lib directly.
- PDF implementation details belong in packages/pdf behind the PdfAdapter abstraction.
- Follow existing Merge PDF architecture, testing style, and UX patterns where practical.

Design goal:
The Split PDF implementation should establish the reusable implementation pattern for future page-based tools such as:

- Reorder Pages
- Delete Pages
- Extract Pages (future)
- Other page-selection workflows

Favor:

- reuse of existing utilities
- reuse of existing validation
- simple maintainable code
- consistency with Merge PDF

Avoid:

- broad refactors
- speculative abstractions
- feature creep
- unnecessary dependencies

Before creating any new page-range parsing or validation logic:

- Inspect existing page-range utilities in packages/core.
- Reuse existing implementations whenever practical.
- Do not duplicate validation logic that already exists.

Feature definition:

Split PDF means:

"Break one input PDF into multiple output PDFs."

Implement exactly these three modes:

1. Split Every Page

- Default mode.
- A PDF with N pages produces N output PDFs.

Example:

Input:
5-page PDF

Output:

- page-1.pdf
- page-2.pdf
- page-3.pdf
- page-4.pdf
- page-5.pdf

2. Split Every N Pages

- User enters a positive integer chunk size.

Example:

Input:
20-page PDF

Chunk size:
5

Output:

- pages-1-5.pdf
- pages-6-10.pdf
- pages-11-15.pdf
- pages-16-20.pdf

- If the final chunk contains fewer than N pages, still generate it.

3. Split By Custom Ranges

- User specifies one or more page ranges.
- Each range produces a separate output PDF.

Example:

Input:
20-page PDF

Ranges:
1-3
4-10
11-20

Output:

- part-1-pages-1-3.pdf
- part-2-pages-4-10.pdf
- part-3-pages-11-20.pdf

- Reuse existing page-range parsing and validation utilities where appropriate.

Functional requirements:

1. Navigation / Page

- Add or complete a Split PDF route/page.
- Match the existing application structure and styling.

2. File Selection

- Allow selecting exactly one PDF file.
- Support drag-and-drop if consistent with Merge PDF.
- Reject invalid files gracefully.
- Reuse the existing page-count loading approach from Merge PDF where practical.
- Display:
  - filename
  - page count

3. Mode Selection

Provide clear controls for:

- Every Page
- Every N Pages
- Custom Ranges

Default to Every Page.

4. Validation

Validate and display clear user-facing errors for:

- no file selected
- invalid file
- corrupted PDF
- encrypted/password-protected PDF
- invalid chunk size
- empty range input
- malformed ranges
- page numbers outside document bounds
- start page greater than end page
- adapter failures

Error messages should be sanitized and user-friendly.

5. Split Operation

- Use PdfAdapter.split().
- Implement LocalPdfAdapter.split() inside packages/pdf.
- Do not bypass adapter boundaries.
- Generate output PDFs in deterministic order.
- Preserve local-only processing.

6. Output Handling

Split PDF produces multiple outputs.

V1 behavior:

- Generate a results list.
- Show each generated output separately.
- Provide an individual download button/link for each output.

Explicitly do NOT:

- generate ZIP files
- auto-download multiple files
- trigger bulk browser downloads

Output names should be deterministic and user-friendly.

Examples:

- page-1.pdf
- pages-1-5.pdf
- part-1-pages-1-3.pdf

7. Output Representation

Produce a simple representation of generated output files that supports multiple downloads cleanly.

Do not introduce abstractions unless they are immediately useful to this implementation.

8. Object URL Lifecycle

- Ensure generated download URLs are revoked appropriately.
- Avoid memory leaks when:
  - changing files
  - changing modes
  - regenerating outputs
  - leaving the page

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

Testing requirements:

Unit tests:

- every-page split plan generation
- every-N-pages split plan generation
- custom-range split plan generation
- invalid chunk size handling
- invalid range handling
- output naming
- adapter split success path
- adapter split error path

Workflow/component tests:

- file selection
- mode switching
- range validation
- split action state transitions
- output generation
- output cleanup
- stale output/error cleanup when file or mode changes

E2E tests:

- upload/select valid PDF
- default every-page split flow
- verify at least one generated file downloads
- verify downloaded bytes begin with %PDF-
- verify no-external-requests assertion still passes
- cover at least one validation error path

Implementation notes:

- Reuse Merge PDF patterns where appropriate.
- Reuse existing page-range utilities wherever possible.
- Do not perform broad architectural refactors.
- Do not optimize large-file memory behavior in this pass.
- Do not lazy-load pdf-lib in this pass.
- Do not add heavy dependencies.
- Do not implement ZIP generation.
- Do not implement Extract Pages.

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

- Keep this focused on a production-quality Split PDF feature.
- Follow the established Merge PDF pattern.
- Reuse existing infrastructure wherever practical.
- If a requested change requires significant refactoring, stop and explain rather than proceeding.
