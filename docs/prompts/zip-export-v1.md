# Implement Split PDF ZIP Export (V1 Polish)

## Context

LocalDocs currently supports:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

Split PDF currently generates one downloadable PDF per output.

This works correctly but becomes cumbersome for large splits (for example, 100–500 output PDFs).

ZIP Export has been promoted from V1.5 into V1 Polish.

This is a Split PDF enhancement, not a new standalone feature.

---

# Core Principles

- All processing must remain local.
- No uploads.
- No telemetry.
- No analytics.
- No cloud processing.
- Preserve existing architecture boundaries.
- Keep pdf-lib usage inside packages/pdf.
- ZIP generation belongs in the web layer because it operates on already-generated output files.

---

# Dependency

Use:

- client-zip

Requirements:

- dependency must be browser-compatible
- dependency must remain local-only
- no server processing
- no network requests

Do not introduce alternative ZIP libraries unless a blocker is discovered.

---

# Goal

After a Split PDF operation produces multiple output PDFs:

Users should be able to:

1. Download individual output PDFs exactly as today.
2. Download a single ZIP containing all generated output PDFs.

The ZIP should become the primary convenience action.

Individual downloads must remain available.

---

# Functional Requirements

## 1. Existing Behavior Preservation

Preserve existing Split PDF functionality.

Existing output links must continue working.

Do not remove:

- individual download links
- existing output filenames
- existing split modes

---

## 2. ZIP Export Availability

ZIP export is only available when more than one output PDF exists.

If a split operation produces exactly one output PDF:

- continue showing the normal download link
- do not show Download ZIP

If multiple outputs exist:

- show Download ZIP

---

## 3. ZIP Export

After outputs are generated:

Provide:

- Download ZIP

The ZIP must contain every generated PDF output.

The ZIP contents must exactly match the generated individual outputs.

---

## 4. ZIP Filename

Use:

{original-name}-split.zip

Examples:

- contract.pdf → contract-split.zip
- report.pdf → report-split.zip

Requirements:

- deterministic
- derived from the original uploaded PDF filename
- not derived from generated output names

---

## 5. ZIP Contents

Preserve existing generated filenames.

Example:

ZIP:
- contract-page-001.pdf
- contract-page-002.pdf
- contract-page-003.pdf

Do not rename outputs specifically for ZIP export.

ZIP export should package the existing outputs.

Filenames inside the ZIP should match the filenames shown to users for individual downloads.

---

## 6. Output Presentation

Display the number of generated outputs.

Examples:

Generated:
- 47 PDFs

or

Generated 47 PDFs

If multiple outputs exist:

- Download ZIP should appear before individual download links.
- Download ZIP should be visually emphasized relative to individual downloads.

Individual downloads must remain available.

---

## 7. ZIP Utility Boundary

Create a small ZIP utility module.

Do not scatter direct client-zip usage throughout UI components.

Keep ZIP creation logic localized and easy to replace in the future.

Do not create a large abstraction layer.

Keep it simple and focused.

---

## 8. State Cleanup

Avoid stale:

- ZIP downloads
- ZIP object URLs
- generated outputs
- errors

when:

- file changes
- split settings change
- outputs regenerate
- PDF load fails

ZIP state must remain synchronized with Split output state.

---

## 9. Object URL Lifecycle

Review both:

- individual PDF URLs
- ZIP URL

Ensure URLs are revoked appropriately.

Avoid memory leaks.

---

## 10. Memory Behavior

Use client-zip in a way that avoids unnecessary intermediate duplication.

The browser will still ultimately create a ZIP Blob for download.

That is acceptable.

Avoid creating additional large in-memory copies when practical.

---

## 11. Accessibility

Verify:

- Download ZIP is keyboard accessible
- ZIP action has an appropriate accessible name
- output information remains understandable to screen readers

---

## 12. Privacy

Confirm no new:

- fetch
- XMLHttpRequest
- sendBeacon
- analytics
- telemetry
- upload paths

are introduced.

ZIP generation must remain entirely local.

---

# Testing Requirements

## Unit Tests

Cover:

- ZIP filename generation
- ZIP state creation
- ZIP state cleanup
- ZIP regeneration

## Component Tests

Cover:

- ZIP button appears after split
- ZIP button absent before outputs exist
- ZIP button hidden when only one output exists
- ZIP button updates after re-splitting
- ZIP state clears appropriately

## E2E Tests

Cover:

- split PDF
- generate outputs
- Download ZIP appears
- ZIP download uses expected filename
- no-external-request assertions continue to pass

Do not attempt deep ZIP inspection in Playwright unless practical.

---

# Scope Control

Do not implement:

- password-protected ZIPs
- encrypted ZIPs
- compression settings
- custom archive names
- Download All automation
- ZIP export for other workflows

This pass is Split PDF ZIP export only.

---

# Validation

Run:

- pnpm format:check
- pnpm typecheck
- pnpm lint
- pnpm test
- pnpm test:e2e
- pnpm build

---

# Output

Provide:

1. Summary of changes.
2. Architecture decisions.
3. Files modified.
4. Validation results.
5. Known limitations.
6. Recommended hardening follow-up.