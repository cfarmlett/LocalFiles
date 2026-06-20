Status: Completed historical implementation task.

Implement SP-001: ZIP Export for Split PDF.

Context:

- V1.5 feature work is complete except SP-001.
- Split PDF currently generates one or more PDF outputs.
- Large split operations can produce many files, making download management cumbersome.
- UX-003 introduced the reusable Export Result Panel and array-based result model.
- UX-004 introduced Clear behavior and async invalidation safeguards.
- UX-005 introduced collapsible generated-file lists.
- Preserve LocalFiles' privacy-first, local-only architecture.
- Do not add cloud processing, analytics, telemetry, external uploads, accounts, or network dependencies.

Goal:

Add ZIP export support to Split PDF so users can download all generated split PDFs as a single ZIP archive while preserving existing individual PDF downloads.

Success Criteria:

- Split PDF users can download all generated outputs as a ZIP.
- Individual PDF downloads remain available.
- ZIP generation happens entirely in the browser.
- ZIP export is derived from the already-generated Split outputs.
- ZIP generation does not rerun Split PDF processing.
- Existing Split PDF generation behavior remains unchanged.
- Existing UX-003 Export Result Panel behavior remains intact.

---

## ZIP Export Architecture

ZIP export is a convenience download artifact built from the current generated Split outputs.

Requirements:

- Existing generated split outputs remain the canonical results.
- ZIP export must be derived from those existing outputs.
- ZIP export must not rerun PDF splitting.
- ZIP export must not become a second source of truth.
- ZIP generation should use the already-generated PDF bytes held by the Split workflow.
- ZIP generation should remain entirely local.
- ZIP export state must remain owned by the Split workflow.
- Do not introduce shared export state across workflows.
- Avoid unnecessary duplication of generated PDF bytes where practical.
- ZIP export should reuse existing generated outputs rather than creating parallel copies.

Implementation approach:

- Prefer the existing planned `client-zip` approach if already present or documented.
- Do not introduce a large ZIP framework.
- Keep browser-specific Blob/URL behavior in `apps/web`.
- Keep Split workflow state owned by Split PDF.
- Reuse existing UX-003 result-item patterns where practical.

### ZIP Generation Strategy

ZIP generation may occur lazily when the user requests the ZIP download.

The implementation should avoid generating and storing large ZIP artifacts unnecessarily if the ZIP is never downloaded.

The exact implementation is flexible, but should favor efficiency and avoid unnecessary memory usage.

If ZIP generation is performed lazily:

- Provide reasonable user feedback while ZIP creation is in progress.
- Do not leave the user wondering whether the action succeeded.

---

## Required Behavior

### Multi-Output Split Results

If Split PDF produces more than one output:

- ZIP export should be available.

Generate:

```text
page-1.pdf
page-2.pdf
page-3.pdf
```

and provide:

```text
document-split.zip
```

containing those files.

ZIP export is an additional download artifact.

Individual split PDFs remain first-class outputs.

### Single-Output Split Results

If Split PDF generates exactly one output:

- Do not create a ZIP artifact.
- Do not show a ZIP download action.
- Continue using the existing single-output experience.

Examples:

Valid:

```text
page-1.pdf
```

Not desired:

```text
page-1.pdf
page-1.zip
```

---

## Export Result Panel Integration

For multi-output Split results:

- Show a primary ZIP download action within the Export Result Panel.
- Place it above or adjacent to the generated-file list.
- Preserve the existing generated-file list below it.
- Preserve existing generated-file collapse/expand behavior.
- Preserve visible output counts.
- Preserve individual PDF download links.

Do not:

- Create a second Export Result Panel.
- Create a parallel output-management UI.
- Hide individual downloads behind ZIP export.

ZIP export should solve the many-files problem while preserving direct access to individual files.

### Generated File Counts

The generated-file count should continue to represent the number of generated PDF outputs.

Examples:

If Split generates:

```text
11 PDFs
```

and a ZIP download is available:

```text
Generated Files (11)
```

is correct.

Do not count the ZIP artifact as an additional generated file.

The ZIP is a convenience download, not a generated document result.

---

## ZIP Naming

ZIP filename generation should remain local to Split PDF.

Convention:

```text
original-name-split.zip
```

Examples:

```text
contract.pdf
→ contract-split.zip
```

```text
my.document.pdf
→ my.document-split.zip
```

Do not introduce a new global filename-management framework.

### ZIP Contents

ZIP contents should use existing generated output filenames wherever practical.

Examples:

```text
contract-page-1.pdf
contract-page-2.pdf
contract-pages-1-5.pdf
contract-pages-6-10.pdf
```

---

## UX Requirements

Users should clearly understand that:

- ZIP download contains all generated split PDFs.
- Individual downloads remain available.
- Generated output count remains visible.
- ZIP is intended as the preferred bulk-download action.

Existing UX-005 collapse behavior must continue working.

### Additive Behavior

ZIP export should be additive.

Users who never use ZIP export should experience the same Split workflow they use today.

ZIP export should not alter existing Split usage patterns beyond providing a more convenient bulk-download option.

---

## Stale Output Requirements

ZIP artifacts must follow the same stale-output invalidation rules as existing Split outputs.

Requirements:

- Changing Split configuration invalidates ZIP export.
- Changing Split source files invalidates ZIP export.
- Clear removes ZIP export state.
- Regenerating outputs updates ZIP export.
- Existing stale-output invalidation behavior remains intact.

The ZIP download must always correspond exactly to the currently visible generated outputs.

Any ZIP-related download state or artifacts must be invalidated alongside the current Split outputs.

---

## Error Handling

ZIP generation failures should:

- Produce clear user-facing errors.
- Be distinguishable from PDF-processing failures.
- Not imply upload/cloud failures.
- Not clear valid generated PDF outputs unless necessary.
- Not invalidate or remove successfully generated split PDF outputs.

Existing generated PDFs should remain usable if ZIP creation fails.

---

## Accessibility

Requirements:

- ZIP action must be keyboard-accessible.
- ZIP action must have a clear accessible name.
- Individual downloads must remain keyboard-accessible.
- Existing collapse/expand accessibility must remain intact.

---

## Important Constraints

Do not:

- Remove individual Split downloads.
- Change Split parsing behavior except as needed for ZIP integration.
- Change Split page-count validation.
- Change Metadata Removal behavior.
- Change Merge/Reorder/Rotate/Delete workflows.
- Implement batch processing.
- Implement broader filename hygiene.
- Add accounts, uploads, analytics, telemetry, or external processing.
- Introduce unrelated refactors.

Keep changes focused on SP-001.

---

## Before Making Changes

1. Summarize current Split output generation and result state.
2. Identify how UX-003 currently represents multi-output Split results.
3. Identify whether ZIP-related dependencies or documentation already exist.
4. Explain whether `client-zip` will be used or whether an existing local-only ZIP approach is already present.
5. Describe the intended Export Result Panel ZIP experience.
6. Explain how ZIP artifacts will be invalidated alongside Split outputs.
7. Describe whether ZIP generation will be eager or lazy and why.

Then implement.

---

## Testing Requirements

Add or update tests as appropriate.

### Split Behavior

Verify:

- Existing Split output generation still works.
- Individual PDF downloads still work.
- Existing validation behavior still works.

### ZIP Behavior

Verify:

- ZIP download/action appears after multi-output Split generation.
- ZIP filename follows:
  `original-name-split.zip`
- ZIP generation uses current generated outputs.
- ZIP generation does not rerun Split processing.
- Single-output Split results do not show ZIP export.

### ZIP Contents

Verify expected generated PDFs are included in the ZIP.

Prefer unit tests for ZIP archive composition where practical.

E2E tests should focus on user-visible behavior rather than ZIP internals.

Do not introduce excessive E2E complexity solely to inspect ZIP contents.

### Repeated ZIP Usage

Verify:

- ZIP download can be used multiple times.
- Repeated ZIP downloads do not require re-running Split PDF generation.
- Repeated ZIP downloads continue to correspond to the current generated outputs.

### Stale Output

Verify:

- Configuration changes invalidate ZIP export.
- Source-file changes invalidate ZIP export.
- Clear removes ZIP export.
- Regeneration updates ZIP export.

### UX

Verify:

- Multi-output Split results show a primary ZIP action plus individual downloads.
- Generated-file counts continue to count PDFs only.
- Existing collapse/expand behavior remains intact.

### Privacy

Verify:

- ZIP generation remains local-only.
- No external requests are introduced.

Preserve UX-003, UX-004, UX-005, and Split validation behavior.

---

## After Implementation Report

Report:

- Summary
- Architecture decisions
- UX behavior before vs after
- Files modified
- Tests added or updated
- Validation results
- Known limitations
- Recommended hardening/review follow-up

Run:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e

Report all failures and likely causes.
