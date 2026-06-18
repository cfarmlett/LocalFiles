Status: Completed historical hardening implementation task.

Read the SP-001 hardening review findings and implement only the focused SP-001 hardening fixes.

Scope:

Implement these fixes:

1. Add a stale-output/token guard to ZIP download generation.
2. Make ExportResultPanel primary-action busy text generic via a caller-provided `busyLabel`.
3. Add ZIP32 limit checks with targeted tests.

Do not implement the Nice To Have items unless required by the fixes above.

Requirements:

- Do not broaden scope.
- Do not redesign ZIP export.
- Do not replace the local ZIP writer with a dependency.
- Do not add compression.
- Do not add ZIP64.
- Do not modify unrelated workflows.
- Preserve Split PDF individual downloads.
- Preserve lazy ZIP generation.
- Preserve UX-003 Export Result Panel architecture.
- Preserve UX-004 Clear behavior and async invalidation safeguards.
- Preserve UX-005 collapsible generated-file behavior.
- Preserve existing Split parsing and page-count validation behavior.
- Preserve LocalDocs' local-only/privacy-first architecture.
- Do not add network activity, telemetry, analytics, accounts, uploads, external processing, or dependencies.

---

## Expected Behavior

### Stale ZIP Guard

ZIP download must always correspond to the currently visible Split outputs.

If a user clicks `Download ZIP`, then:

- clears the workflow
- changes Split configuration
- loads a new file
- regenerates Split outputs

before ZIP generation/download completes:

- stale ZIP output must not download
- stale ZIP errors must not appear
- current visible Split state must remain authoritative

Reuse the existing UX-004 async invalidation approach if practical rather than introducing a new concurrency pattern.

When ZIP generation becomes invalid because of Clear, file replacement, configuration change, or regeneration:

- ZIP generation should fail silently
- no cancellation error should be shown
- no stale ZIP-related UI should appear

Repeated ZIP downloads must continue to work without requiring Split PDF regeneration.

---

### Generic Primary Action Busy Label

`ExportResultPanel` must remain workflow-agnostic.

If the primary action can show busy text:

- `ExportResultPanel` should not hard-code ZIP-specific text
- Split PDF should provide ZIP-specific text such as:

  - `Preparing ZIP...`

Do not introduce Split-specific types, props, naming, or assumptions into `ExportResultPanel` beyond a generic primary-action busy-label capability.

The reusable UX-003 panel should remain suitable for future workflows.

---

### ZIP32 Limits

The local ZIP writer should detect unsupported ZIP32 limits before writing malformed archives.

Add explicit checks for relevant ZIP32 limits, such as:

- entry count exceeding ZIP32 support
- individual entry size exceeding ZIP32 field capacity
- central directory size exceeding ZIP32 field capacity
- central directory offset exceeding ZIP32 field capacity
- archive offsets exceeding ZIP32 field capacity

If a limit would be exceeded:

- throw a ZIP-specific error before producing an invalid archive
- surface a clear user-facing ZIP export error
- preserve individual generated PDF outputs

The error should clearly indicate that ZIP export exceeds supported archive limits rather than implying a PDF-processing failure.

ZIP failures must not invalidate, remove, or replace valid generated PDF outputs.

---

## Testing Requirements

Add or update targeted tests for:

### Stale ZIP Lifecycle

- ZIP generation invalidated by Clear
- ZIP generation invalidated by source-file replacement
- ZIP generation invalidated by Split configuration changes
- ZIP generation invalidated by regeneration

Verify stale ZIP downloads do not occur.

Verify stale ZIP errors do not appear.

### Export Result Panel

- generic `busyLabel` support
- existing primary-action behavior remains intact

### ZIP32 Limits

Add targeted coverage for each newly added ZIP32 guard path where practical.

Examples:

- entry count limit
- entry size limit
- central directory size limit
- offset limit

### ZIP Failure Behavior

Verify:

- ZIP-specific errors are shown when appropriate
- ZIP failures do not invalidate generated PDF outputs
- ZIP failures do not remove valid individual PDF downloads

### Regression Coverage

Preserve existing coverage for:

- multi-output ZIP availability
- ZIP filename generation
- ZIP contents
- repeated ZIP downloads
- single-output no-ZIP behavior
- individual PDF downloads
- no-external-request guarantees
- UX-003 behavior
- UX-004 behavior
- UX-005 behavior
- Split validation behavior

---

## Architecture Requirements

- Keep ZIP export derived from existing Split outputs.
- Do not rerun Split PDF processing.
- Do not create a second source of truth.
- Keep ZIP state local to Split PDF.
- Preserve current Export Result Panel structure.
- Preserve current Split output ownership model.
- Keep changes focused and incremental.

---

## After Implementation Report

Report:

- Summary
- Files changed
- Fixes made
- Tests added or updated
- Validation results
- Remaining limitations

Run:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e

Report all failures and likely causes.
