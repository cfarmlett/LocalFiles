# LocalFiles Release History

This file summarizes major milestones. [`CHANGELOG.md`](../CHANGELOG.md) remains
the detailed source for verifiable release-by-release changes.

## Current Status

LocalFiles is at `1.5.0-rc1`. It is a release candidate undergoing final
validation and early feedback, not the final `1.5.0` release.

The existing `v1.5.0-rc2` tag was created during the pre-public LocalFiles
rename, but its tagged commit still declares version `1.5.0-rc1`. It is retained
as historical tag metadata rather than treated as a separate release. The root
`package.json` remains authoritative.

## Improvements Since 1.5.0-rc1

- Simplified Split PDF to two plain-language modes: a page interval that
  defaults to one page, and custom ranges.
- Added zero-padded sequence numbers to single-page Split PDF outputs and
  sortable `part-N-` prefixes to range-based outputs so generated files retain
  their intended order in lexicographic sorting and ZIP archives.
- Added natural numeric filename sorting for newly selected Merge PDF batches
  without changing existing or manually arranged file order.
- Added a shared professional PDF file picker across the implemented workflows,
  preserving native file input behavior while improving drag-and-drop and
  keyboard accessibility.
- Refined the app shell with hash navigation correctness, a clearer header
  hierarchy, a more compact hero, and a shared content rail for the header,
  hero, workflows, Redact limitation, and Privacy section.
- Made trust and limitation cues easier to verify through prominent Privacy
  access, source/license/privacy/security links, and an explicit unavailable
  state for Redact PDF.

## Foundation and Prototype

The project began as LocalDocs with a privacy-first premise: useful document
workflows should run locally whenever feasible, with no surprise uploads.

The foundation established:

- a pnpm monorepo with application, domain, PDF, UI, and configuration
  boundaries;
- a static React/Vite browser application;
- the `PdfAdapter` boundary around PDF implementation details;
- automated format, type, lint, unit, browser, and build checks;
- a threat model and an accepted local-first processing decision; and
- review practices for privacy-sensitive changes.

The fuller foundation narrative is preserved in
[`archive/project-history.md`](archive/project-history.md).

## V1 Core PDF Toolkit

The initial product milestone delivered local browser workflows for:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

The product also established conservative limits: Metadata Removal is not
described as forensic sanitization, and browser redaction remains unavailable
because the current stack cannot provide the required guarantee.

The completed V1 specification is archived at
[`archive/v1-product-spec.md`](archive/v1-product-spec.md).

## V1.5 Workflow Polish and Release Candidate

The V1.5 milestone focused on making the existing toolkit easier to use before
external feedback. It added or completed:

- persistent export result panels;
- clear-document and reset-order actions;
- collapsible feature content;
- drag-and-drop page reordering with button alternatives;
- Split PDF ZIP export with stale-output and ZIP32 safeguards;
- stronger Split range validation;
- Metadata Removal suffix idempotency; and
- wording, label, and status-announcement polish.

The resulting `1.5.0-rc1` candidate passes the repository's automated release
checks documented at the time of the milestone. Final manual validation and
feedback remain current roadmap work.

The detailed plan is preserved in
[`archive/v1.5-product-spec.md`](archive/v1.5-product-spec.md).

## Pre-Public-Launch Rename

The project was renamed from LocalDocs to LocalFiles before public launch to
support a broader future of privacy-first local file processing. Current code,
packages, copy, and planned domain branding use LocalFiles. Historical commits,
tags, and release records retain their original context where useful.
