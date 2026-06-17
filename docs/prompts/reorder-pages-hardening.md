Read and follow:

docs/prompts/hardening-template.md

Feature:

Reorder Pages

Feature-specific review focus:

1. Page-Order Integrity

Verify the generated PDF contains:

- every original page
- exactly once
- in the user-selected order

No pages should be duplicated.

No pages should be omitted.

2. PdfAdapter.reorder()

Review the new adapter contract.

Confirm:

- it is appropriately scoped
- it improves clarity compared to reusing existing APIs
- implementation remains entirely inside packages/pdf

3. PageListItem Design

Review the page-list workflow design.

Confirm it provides a reasonable foundation for future tools:

- Rotate Pages
- Delete Pages
- Extract Pages (future)

Assess whether the design is likely to support future page actions without significant rework.

4. Reordering Controls

Verify:

- Move Up behavior
- Move Down behavior
- boundary conditions for first page
- boundary conditions for last page

Confirm page-order state remains valid after repeated operations.

5. Large Document Behavior

Review behavior for PDFs containing many pages.

The page list may contain hundreds of rows.

This is acceptable for V1.

Do not introduce:

- virtualization
- pagination
- thumbnails
- previews

unless a concrete defect exists.

6. Output Verification

Review tests and determine whether page-order correctness is being verified strongly enough.

Confirm at least one meaningful test can distinguish:

Original:

- Page 1
- Page 2
- Page 3

from:

Reordered:

- Page 3
- Page 2
- Page 1

Verify actual page ordering, not merely output page count, whenever practical.

Do not add large fixtures unless necessary.

7. Page Order State Cleanup

Verify page-order state is correctly reset when:

- file changes
- invalid file selection occurs
- PDF load fails
- a new PDF is selected

Confirm no stale page-order state can survive across documents.

8. Reordering Accessibility

Verify:

- Move Up controls are clearly labeled
- Move Down controls are clearly labeled
- screen readers can identify the affected page
- first-page controls behave appropriately
- last-page controls behave appropriately
- disabled states are communicated clearly

Output:

In addition to the standard hardening-template output, include:

- Assessment of PdfAdapter.reorder()
- Assessment of PageListItem future-tool readiness
- Assessment of page-order verification strength in the test suite
