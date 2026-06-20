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
- Apply feedback-driven usability and visual polish.
- Make output naming and export behavior more predictable.
- Evaluate additional privacy-oriented PDF utilities without weakening the
  local-processing model.

## Later: Expand Local Workflows

Potential directions include file conversion, batch processing, stronger PDF
sanitization, and local OCR. Scope and sequencing will depend on real usage,
browser constraints, and maintenance cost.

## Explore: Capabilities That Need Research

Redaction, a desktop application, and AI-assisted document features require
separate trust and feasibility work before they can enter a release plan.
Investigation does not imply commitment.

## Roadmap Rules

- Keep this file short and milestone-oriented.
- Record individual feature ideas in `docs/FEATURE_BACKLOG.md`.
- Record technical choices in `docs/decisions`.
- Record research and open questions in `docs/investigations`.
- Record completed work in `docs/RELEASE_HISTORY.md` and `CHANGELOG.md`.
