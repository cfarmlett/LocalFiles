Read and follow:

docs/prompts/hardening-template.md

Feature:

Metadata Removal

Feature-specific review focus:

## 1. Metadata Removal Correctness

Verify:

- metadata displayed in the UI matches metadata read from the adapter
- metadata removal actually removes the targeted metadata fields
- generated PDFs contain the expected cleaned metadata state

Do not rely solely on successful PDF generation.

Verify actual metadata values before and after removal whenever practical.

Review metadata after saving the generated PDF, not only before save.

Some PDF libraries regenerate metadata fields during serialization.

Verify actual output behavior.

---

## 2. Content Preservation

Verify metadata removal does not alter:

- page count
- page order
- page contents
- page rotations

unless required by the PDF library.

Metadata Removal should behave as a metadata-only transformation.

---

## 3. Privacy Claim Accuracy

Review all user-facing language.

Confirm the implementation does not imply:

- complete forensic sanitization
- removal of every possible metadata representation
- removal of embedded files
- removal of annotations
- removal of form data
- removal of PDF JavaScript

unless such behavior is actually implemented and verified.

Review:

- page descriptions
- button labels
- help text
- privacy messaging
- status messages

Confirm the UI accurately describes what is removed.

The privacy claim must match the implementation.

---

## 4. PdfAdapter Metadata Contract

Review any new adapter APIs.

Confirm:

- scope is appropriate
- implementation remains inside packages/pdf
- adapter boundary remains clean
- API shape is consistent with existing adapter design

---

## 5. Metadata Display Accuracy

Verify:

- displayed metadata fields match adapter output
- missing fields are handled correctly
- empty metadata state is communicated clearly
- metadata updates correctly when files change

Confirm no stale metadata from a previous document can appear.

Verify documents with no removable metadata behave correctly.

Confirm:

- metadata display remains accurate
- user messaging is clear
- workflow behavior is reasonable

---

## 6. State Cleanup

Verify metadata state resets correctly when:

- file changes
- invalid file selection occurs
- PDF load fails
- a new PDF is selected

Review stale output handling.

Confirm generated outputs are cleared when metadata state changes.

---

## 7. Accessibility

Verify:

- metadata information is accessible to screen readers
- action buttons are clearly labeled
- status and error messages are communicated appropriately

---

## 8. Output Verification

Review tests and determine whether metadata removal is being verified strongly enough.

Prefer tests that:

- create metadata
- remove metadata
- verify metadata is absent afterward

rather than simply verifying output generation.

Do not add large fixtures unless necessary.

---

## 9. Scope Control

Confirm no unintended V1 scope expansion occurred.

Verify the feature does not introduce:

- metadata editing
- metadata replacement
- selective field removal
- annotation removal
- form removal
- JavaScript removal
- embedded-file removal
- forensic sanitization claims

unless explicitly implemented and verified.

---

## 10. Dependency Review

Review any new dependencies.

Confirm no unnecessary dependency was introduced solely for metadata removal.

---

# Additional Output

In addition to the standard hardening-template output, include:

- Assessment of metadata-removal correctness
- Assessment of privacy-claim accuracy
- Assessment of metadata-verification strength in the test suite
- Assessment of adapter contract quality
- Assessment of metadata-display correctness
- Assessment of content-preservation confidence
