# Changelog

This file records notable, verifiable changes to LocalFiles. It does not attempt
to reconstruct undocumented development history.

## Versioning Note

The root `package.json` is the authoritative source for the product version.
The existing `v1.5.0-rc2` tag was created during the pre-public LocalFiles
rename, but its tagged commit still declares version `1.5.0-rc1`. The tag is
retained as historical metadata, not treated as a separate release; the current
supported prerelease remains `1.5.0-rc1`.

## Unreleased

### Changed

- Renamed the project from LocalDocs to LocalFiles before public launch,
  including the `localfiles.org` domain, application branding, downloaded file
  naming, and private workspace package scope.
- Simplified Split PDF to a page interval (defaulting to one page) or custom
  ranges, while preserving existing split results and filenames.
- Zero-padded single-page Split PDF outputs and added padded `part-N-` prefixes
  to range-based outputs according to the result count, while preserving page
  ranges, PDF contents, individual downloads, and ZIP entries.
- Naturally sorted each newly added batch of Merge PDF files by filename while
  preserving the existing list and any manual reordering.

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
