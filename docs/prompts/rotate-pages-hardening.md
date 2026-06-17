Read and follow:

docs/prompts/hardening-template.md

Feature:

Rotate Pages

Feature-specific review focus:

## 1. Rotation Correctness

Verify:

- Rotate Left applies correct rotation.
- Rotate Right applies correct rotation.
- Rotations wrap correctly.
- Rotations normalize correctly.
- Multiple rotations produce expected results.

Examples:

- 0° → Right → 90°
- 90° → Right → 180°
- 270° → Right → 0°
- 0° → Left → 270°

---

## 2. Preserve Page Integrity

Verify Rotate Pages preserves:

- original page order
- original page count
- original page contents

Confirm rotation does not:

- duplicate pages
- omit pages
- reorder pages
- rasterize pages

unless explicitly required by the PDF library.

---

## 3. Existing Rotation Handling

Review how pages with pre-existing rotation are handled.

Confirm behavior is:

- correct, or
- clearly documented as a limitation

Verify no confusing behavior occurs when rotating already-rotated pages.

---

## 4. PdfAdapter Rotation Contract

Review any new adapter APIs.

Confirm:

- scope is appropriate
- implementation remains inside packages/pdf
- adapter boundary remains clean
- API shape is consistent with existing adapter design

---

## 5. Page-List Reuse

Review whether Rotate Pages successfully reuses the page-list pattern established by Reorder Pages.

Identify:

- duplicated logic
- unnecessary divergence
- maintainability concerns

Only recommend changes if a concrete issue exists.

---

## 6. Rotation State Cleanup

Verify rotation state resets correctly when:

- file changes
- invalid file selection occurs
- PDF load fails
- a new PDF is selected

Confirm no stale rotation state survives across documents.

---

## 7. Rotation Accessibility

Verify:

- Rotate Left controls are clearly labeled
- Rotate Right controls are clearly labeled
- affected page is identifiable to screen readers
- disabled states are communicated appropriately

---

## 8. Output Verification

Review tests and determine whether output rotation is being verified strongly enough.

Prefer verification of actual rotation values rather than only successful PDF generation.

Confirm tests distinguish:

- unrotated output
- rotated output

whenever practical.

Do not add large fixtures unless necessary.

---

## 9. Scope Control

Confirm no unintended V1 scope expansion occurred.

Verify the feature does not introduce:

- Rotate All
- batch rotation
- multi-page selection
- thumbnails
- previews
- virtualization
- pagination

unless explicitly required by the implementation.

---

## 10. Large Document Behavior

The page list may contain hundreds of rows.

This is acceptable for V1.

Do not introduce:

- virtualization
- pagination
- thumbnails
- previews

unless a concrete defect exists.

---

# Additional Output

In addition to the standard hardening-template output, include:

- Assessment of rotation correctness
- Assessment of page-list reuse quality
- Assessment of rotation verification strength in the test suite
- Assessment of adapter contract quality
- Assessment of existing-rotation handling
