Review and harden the existing Split PDF implementation.

Context:

- Split PDF V1 has already been implemented.
- This is a focused hardening/review pass.
- Do not implement new features.
- Do not implement Extract Pages.
- Do not add ZIP output, bulk download, auto-download, OCR, AI, compression, uploads, telemetry, analytics, accounts, subscriptions, or backend/cloud processing.
- Do not perform broad refactors.
- Make only small, scoped fixes for issues actually found.

Review standard:

Prefer proven defects over hypothetical improvements.

Do not make changes solely because something could be improved.

Only modify code when:

- a bug exists
- a stale state exists
- a memory leak risk exists
- an accessibility issue exists
- a privacy issue exists
- a test gap exists
- a maintainability issue is concrete and low-risk to fix

Preserve the existing Split PDF workflow and user experience.

Do not redesign:

- mode selection
- page range entry
- download workflow
- results presentation

unless required to fix a specific issue.

Review focus:

1. Split mode correctness

Verify the three modes behave correctly:

- Every Page
- Every N Pages
- Custom Ranges

Check edge cases:

- one-page PDFs
- final chunk smaller than N
- chunk size larger than page count
- empty range input
- malformed ranges
- out-of-bounds pages
- start page greater than end page
- duplicate ranges
- overlapping ranges

Do not change intended V1 behavior unless there is a clear bug.

2. Custom range UX clarity

Custom ranges produce separate output PDFs.

Ensure the UI clearly communicates this behavior.

Example:

Input ranges:
1-3
4-10
11-20

Output:
part-1-pages-1-3.pdf
part-2-pages-4-10.pdf
part-3-pages-11-20.pdf

If the current UI could reasonably confuse users about how ranges map to output files, make a small clarification through labels, helper text, or validation messaging.

Do not redesign the workflow.

3. Existing utility reuse

Inspect the implementation and confirm:

- existing page-range utilities are reused where appropriate
- validation logic is not unnecessarily duplicated
- Split PDF remains consistent with established architecture patterns

4. Adapter boundary

Confirm:

- web app does not import pdf-lib directly
- PDF page copying remains inside packages/pdf
- Split uses PdfAdapter.split()
- package boundaries remain intact

5. Privacy / local-only behavior

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

6. Object URL lifecycle

Confirm generated output URLs are revoked appropriately when:

- outputs are replaced
- file changes
- mode changes
- inputs change
- split is rerun
- page unmounts

Fix any memory leak risk with minimal changes.

7. State cleanup

Check for stale:

- validation errors
- adapter errors
- generated outputs
- download links
- selected file state
- page count state

when:

- file changes
- file is removed
- mode changes
- chunk size changes
- custom ranges change
- split is rerun

Fix confusing stale UI states with minimal changes.

8. Error quality

Ensure user-facing errors are:

- clear
- sanitized
- actionable
- consistent with Merge PDF

Cover:

- invalid file
- corrupted PDF
- encrypted/password-protected PDF
- invalid chunk size
- invalid custom ranges
- adapter failures

9. Accessibility

Check practical accessibility for:

- file input
- drop zone
- mode selection
- chunk-size input
- custom-range input
- split button
- result download buttons
- error messages

Make small improvements such as:

- labels
- aria-labels
- aria-describedby
- role="alert"

where appropriate.

Do not redesign the UI.

10. Test coverage and reliability

Review tests for:

- split plan generation
- adapter split behavior
- mode switching
- validation errors
- output naming
- generated downloads
- no-external-requests assertion

Add or adjust tests only where there is a clear gap or brittleness.

Do not add large fixtures or heavy dependencies.

11. Dependencies and bundle

Confirm no unnecessary dependencies were introduced.

Do not address the existing Vite chunk-size warning in this pass.

Validation:

Run and fix issues from:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e
- pnpm build

Output:

1. Issues found.
2. Fixes made.
3. Files modified.
4. Validation results.
5. Remaining known limitations.
6. Whether Split PDF is ready for independent review.

Important:

If no issues are found in an area, explicitly say so.

If a possible improvement requires significant refactoring, defer it and explain why.

Keep this a focused hardening pass, not a feature-development pass.
