Read and follow:

docs/prompts/hardening-template.md

Feature:

Split PDF ZIP Export

Feature-specific review focus:

## 1. ZIP Contents Correctness

Verify:

- ZIP contains every generated Split PDF output
- no outputs are missing
- no duplicate entries are created
- filenames inside the ZIP match generated output filenames

Review actual ZIP generation logic.

Do not rely solely on UI state.

---

## 2. ZIP Filename Correctness

Verify:

{original-name}-split.zip

is generated consistently.

Review edge cases:

- spaces
- punctuation
- multiple dots
- unusual filenames

Confirm behavior is reasonable and deterministic.

---

## 3. Filename Preservation

Verify:

- filenames inside the ZIP exactly match the filenames offered through individual download links
- ZIP packaging does not alter filenames
- displayed filenames remain consistent

This is a core correctness requirement.

---

## 4. Output Consistency

Verify:

- individual download links still work
- ZIP export uses the same generated outputs
- ZIP export and individual downloads remain synchronized

The ZIP must not contain stale outputs.

---

## 5. Single-Output Behavior

Review behavior when exactly one output PDF is generated.

Confirm implementation matches requirements:

- normal download remains available
- ZIP export is hidden

Verify no confusing or redundant ZIP workflow exists.

---

## 6. Output Count Accuracy

Verify any displayed output count accurately reflects:

- generated outputs
- ZIP contents
- individual downloads

Counts should remain synchronized.

---

## 7. State Cleanup

Verify cleanup when:

- PDF changes
- split mode changes
- split settings change
- outputs regenerate
- PDF loading fails

Confirm stale ZIP downloads cannot remain visible.

Confirm ZIP export disappears when outputs are removed or cleared.

---

## 8. Object URL Lifecycle

Review:

- individual PDF object URLs
- ZIP object URLs

Confirm:

- URLs are revoked
- URLs are replaced correctly
- repeated ZIP generation does not leak resources

---

## 9. Large Output Behavior

Review behavior for:

- dozens of outputs
- hundreds of outputs

Assess:

- unnecessary memory duplication
- obvious performance problems
- lifecycle issues

This is a review, not a performance optimization task.

Do not introduce major refactors.

---

## 10. Accessibility

Verify:

- Download ZIP is accessible
- keyboard navigation works
- accessible names are clear
- screen-reader users can distinguish ZIP export from individual downloads

---

## 11. Dependency Review

Review usage of:

- client-zip

Confirm:

- scope is appropriate
- no unnecessary functionality was introduced
- no network behavior exists
- license assumptions remain consistent

---

## 12. Privacy Review

Confirm ZIP export introduces no:

- uploads
- telemetry
- analytics
- network requests
- cloud processing

ZIP generation must remain entirely local.

---

## 13. Scope Control

Confirm the implementation did not introduce:

- ZIP export for other workflows
- archive encryption
- password protection
- custom naming
- download automation
- unrelated workflow changes

---

# Additional Output

In addition to the standard hardening-template output, include:

- Assessment of ZIP-content correctness
- Assessment of ZIP filename behavior
- Assessment of filename-preservation confidence
- Assessment of memory/lifecycle confidence
- Assessment of dependency appropriateness
- Assessment of privacy impact

Prefer evidence-based findings over speculative improvements.

If no issue is found in an area, explicitly state so.
