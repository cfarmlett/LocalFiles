# LocalFiles Roadmap

This roadmap records major product direction, not every possible feature. It
uses horizons instead of dates because LocalFiles is maintained by a solo
developer and priorities may change after feedback.

Ideas become commitments only when they are moved into a defined release.
User-visible candidates live in [the feature backlog](docs/FEATURE_BACKLOG.md),
and unresolved technical questions live in `docs/investigations`.

## Current: Validate V1.5

The current product version is `1.5.0-rc1`.

- Complete final release review and manual testing.
- Share the release candidate with early testers.
- Fix trust, correctness, accessibility, and workflow issues found during
  feedback.
- Promote a final `1.5.0` release only after validation is complete.

## Next: Strengthen the Core PDF Toolkit

- Improve round-trip Split and Merge workflows.
- Apply feedback-driven usability and visual polish, beginning with simpler
  Split PDF controls and plain-language labels.
- Make output naming and export behavior more predictable.
- Evaluate document inspection and verifiable sanitization without weakening
  the local-processing model or overstating guarantees.

## Later: Add Page Preview and Visual Editing

Establish a shared, local page-preview foundation so users can inspect and
manipulate pages without coordinating with an external PDF viewer. Build
mobile-friendly visual selection, navigation, and split-point editing on that
foundation across page-based workflows. Treat previews as inspection
infrastructure, not merely visual polish.

## Later: Expand Local Workflows

Potential directions include focused file conversion, batch processing,
verifiable PDF sanitization, and local OCR where it supports a validated
workflow. Broad catalogs and standalone feature parity are lower priorities.
Scope and sequencing will depend on real usage, browser constraints, trust
requirements, and maintenance cost.

## Explore: Capabilities That Need Research

Document inspection, verifiable sanitization, redaction, a desktop application,
and AI-assisted document features require separate trust and feasibility work
before they can enter a release plan. AI-assisted tools are a lower near-term
priority. Investigation does not imply commitment.

## Roadmap Rules

- Keep this file short and milestone-oriented.
- Record individual feature ideas in `docs/FEATURE_BACKLOG.md`.
- Record technical choices in `docs/decisions`.
- Record research and open questions in `docs/investigations`.
- Record completed work in `docs/RELEASE_HISTORY.md` and `CHANGELOG.md`.
