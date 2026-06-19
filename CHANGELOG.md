# Changelog

This file records notable, verifiable changes to LocalDocs. It does not attempt
to reconstruct undocumented development history.

## Unreleased

No entries yet.

## 1.5.0-rc1 - Release Candidate

This is a prerelease for final validation and early feedback, not the final
`1.5.0` release.

### Added

- Local browser workflows for merging, splitting, reordering, rotating, and
  deleting PDF pages.
- Local removal of common PDF document metadata fields.
- ZIP export for multi-output Split PDF operations, including ZIP32 limit and
  stale-output safeguards.
- Persistent export results, clear/reset actions, collapsible workflow content,
  and drag-and-drop page reordering.
- Automated formatting, type checking, linting, unit testing, browser E2E
  testing, and production builds.

### Changed

- Improved Split PDF range validation and Metadata Removal filename handling.
- Aligned workflow labels, status announcements, and Delete Pages wording.

### Security and Privacy

- Document processing remains in browser memory with no document upload path.
- The application includes no analytics, telemetry, advertising, or tracking.
- Browser redaction remains intentionally unavailable because the current
  implementation cannot make a sufficiently strong redaction guarantee.
