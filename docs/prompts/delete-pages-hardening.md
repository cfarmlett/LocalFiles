Read and follow:

docs/prompts/hardening-template.md

Feature:

Delete Pages

Feature-specific review focus:

## 1. Delete Correctness

Verify:

* pages marked for deletion are omitted from the output
* unmarked pages remain in the output
* remaining pages preserve original order
* remaining pages are not duplicated
* page contents are not altered
* pages are not rasterized

Confirm remaining pages appear in the same relative order as the source document.

---

## 2. Delete-All Guard

Verify the workflow prevents generating a zero-page PDF.

Confirm:

* all-pages-deleted state is handled clearly
* output generation is disabled or blocked
* user-facing messaging is clear

Verify both UI and adapter layers prevent generation of a zero-page document.

The guard should not rely solely on UI controls.

---

## 3. PdfAdapter Delete Contract

Review any new adapter APIs.

Confirm:

* scope is appropriate
* implementation remains inside packages/pdf
* adapter boundary remains clean
* API shape is consistent with existing adapter design

---

## 4. Page-List Reuse

Review whether Delete Pages successfully reuses the page-list pattern established by Reorder Pages and reused by Rotate Pages.

Identify:

* duplicated logic
* unnecessary divergence
* maintainability concerns

Only recommend changes if a concrete issue exists.

---

## 5. Deletion State Cleanup

Verify deletion state resets correctly when:

* file changes
* invalid file selection occurs
* PDF load fails
* a new PDF is selected

Confirm no stale deletion state survives across documents.

Review repeated:

* Delete
* Restore
* Delete

workflows.

Confirm page state remains correct after repeated toggling.

Review stale output handling when deletion state changes.

Confirm generated outputs are cleared when page selections change.

---

## 6. Delete / Restore Accessibility

Verify:

* Delete controls are clearly labeled
* Restore controls are clearly labeled
* affected page is identifiable to screen readers
* deleted/marked state is communicated clearly
* disabled states are communicated appropriately

---

## 7. Output Verification

Review tests and determine whether output deletion is being verified strongly enough.

Confirm tests can distinguish:

Original:

* 1
* 2
* 3
* 4
* 5

Delete:

* 2
* 4

Output:

* 1
* 3
* 5

Do not rely solely on output page count.

Prefer verification that actual pages were omitted and remaining pages remain in the correct order.

Do not add large fixtures unless necessary.

---

## 8. Scope Control

Confirm no unintended V1 scope expansion occurred.

Verify the feature does not introduce:

* thumbnails
* previews
* drag-and-drop
* multi-page selection
* select all
* delete all
* range delete
* Extract Pages

unless explicitly required by the implementation.

---

## 9. Large Document Behavior

The page list may contain hundreds of rows.

This is acceptable for V1.

Do not introduce:

* virtualization
* pagination
* thumbnails
* previews

unless a concrete defect exists.

---

# Additional Output

In addition to the standard hardening-template output, include:

* Assessment of delete correctness
* Assessment of delete-all guard
* Assessment of page-list reuse quality
* Assessment of deletion verification strength in the test suite
* Assessment of adapter contract quality
