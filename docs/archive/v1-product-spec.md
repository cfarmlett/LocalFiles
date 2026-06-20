# Archived LocalFiles V1 Product Specification

This completed release specification is preserved for historical context. See
`docs/RELEASE_HISTORY.md` for the current milestone summary.

## Vision

LocalFiles provides privacy-first PDF tools that run entirely on the user's
device. Users can complete common PDF workflows without uploading files,
creating accounts, or sacrificing privacy.

## Product Principles

- All processing occurs locally on the user's device.
- No document uploads to LocalFiles servers.
- No user accounts required.
- No advertisements.
- No analytics or telemetry.
- Open-source first.
- Fast, simple, and trustworthy user experience.

---

## Current V1 Status

The core V1 workflows are implemented and hardened:

- Merge PDF
- Split PDF
- Reorder Pages
- Rotate Pages
- Delete Pages
- Metadata Removal

V1 is now in polish and release-readiness work rather than core workflow
implementation.

---

## Implemented Features

### Merge PDF

Combine multiple PDF files into a single PDF.

Implemented behavior:

- Supports multiple PDF uploads.
- Supports drag-and-drop file selection.
- Allows file reordering before merge.
- Generates a downloadable merged PDF.

### Split PDF

Create new PDFs from selected page ranges.

Implemented behavior:

- Supports splitting every page.
- Supports splitting every N pages.
- Supports custom page ranges.
- Exports selected pages into one or more PDFs.

### Reorder Pages

Change the page order within a PDF.

Implemented behavior:

- Loads page count through the PDF adapter.
- Provides per-page move controls.
- Generates one downloadable reordered PDF.

### Rotate Pages

Rotate one or more pages.

Implemented behavior:

- Supports per-page 90-degree left and right rotation.
- Preserves page order and count.
- Generates one downloadable rotated PDF.

### Delete Pages

Remove pages from a PDF.

Implemented behavior:

- Supports marking one or more pages for deletion.
- Prevents deleting every page.
- Generates one downloadable PDF containing the kept pages.

### Metadata Removal

Remove common embedded document metadata.

Implemented behavior:

- Reads supported metadata fields before removal.
- Removes supported standard document metadata fields.
- Generates a downloadable metadata-removed PDF.

Limitations:

- Metadata Removal is not a forensic sanitizer.
- It does not claim to remove every possible PDF artifact, XMP packet,
  attachment, hidden stream, object history, or embedded content reference.

---

## V1 Polish

The following items remain V1 polish and release-readiness work.

### ZIP Export For Split PDF

Split PDF can produce many output files. ZIP export belongs in V1 polish because
it improves the existing Split workflow without adding a new product category.

Implemented UX:

- Continue supporting individual output downloads.
- Add a local ZIP download when Split PDF produces multiple outputs.
- Preserve generated filenames inside the archive.
- Keep ZIP creation entirely local.

Expected constraints:

- No server-side ZIP creation.
- No cloud processing.
- No dependency should be added without a focused dependency review.
- The first implementation should serve Split PDF only.

### Privacy Page

The Privacy page should explain the local-processing model plainly:

```text
User PDF -> Browser memory -> Local processing -> Download
```

The page should state that files never leave the device in current local
workflows and that the app has no backend, accounts, analytics, telemetry, or
server upload path.

### Accessibility Review

Current posture:

- Workflows use ordinary form controls, buttons, labels, and status regions.
- Page actions are available through buttons rather than drag-only controls.
- Accessibility has not received a full release-readiness review.

Future review items:

- Keyboard navigation through all workflows.
- Focus order after file selection, processing, and errors.
- Screen-reader clarity for page lists and multi-output results.
- Status announcement consistency.
- Color contrast and visible focus states.

### UX Consistency Review

Prioritized polish checklist:

1. Review success messages across Merge, Split, Reorder, Rotate, Delete, and
   Metadata Removal.
2. Review error-message tone and specificity across invalid file, encrypted
   file, corrupted file, empty selection, and invalid page-state paths.
3. Align output naming patterns for generated PDFs and Split ZIP output.
4. Confirm empty states use consistent terminology for selecting or dropping
   files.
5. Confirm Redact PDF placeholder copy remains explicit that redaction is not
   implemented.

### Documentation Alignment

Keep README, product specs, architecture notes, security docs, prompts, and
review artifacts clear about which items are implemented, planned, or
intentionally excluded.

---

## Explicitly Excluded From V1

### Browser Redaction

Browser redaction is intentionally excluded from V1.

Reason:

- The current browser stack does not meet the project's definition of
  successful redaction.
- A visual overlay or partial removal would create false confidence.
- Successful redaction must remove targeted information from all recoverable
  representations, including viewing, searching, copying, extraction,
  inspection, and file analysis paths.
- The completed capability assessment concluded that browser redaction should
  not be shipped as V1 work.

Future desktop or native research may revisit redaction with stronger tooling
and verification. Until then, LocalFiles should communicate that browser
redaction is intentionally unavailable, not forgotten.

### Other Exclusions

The following features are also out of scope for V1:

- OCR
- AI-assisted features
- User accounts
- Desktop applications
- Batch processing
- Word document conversion
- E-signatures
- Cloud processing
- Team collaboration
- Extract Pages

---

## Non-Functional Requirements

### Privacy

- Documents never leave the user's device in current local workflows.
- No document contents are transmitted to LocalFiles servers.
- No analytics, telemetry, trackers, external fonts, or CDN assets.

### Reliability

- Graceful handling of invalid, corrupted, and encrypted PDFs.
- Clear user-facing error messages.

### Accessibility

- Keyboard-accessible interfaces.
- Screen-reader-friendly controls where practical.
- A dedicated accessibility review remains V1 polish.

### Performance

- Responsive UI during processing.
- Efficient handling of typical consumer PDF sizes within browser limits.

### Offline Compatibility

- Processing continues to function without an internet connection after initial
  application load.

---

## Success Criteria

A V1 release is considered complete when:

- Implemented V1 workflows remain local-only and pass validation.
- V1 polish items are completed or explicitly deferred.
- Browser redaction remains excluded unless a future architecture can meet the
  project's redaction definition.
- No unexpected network requests occur during document processing.
- The application is suitable for public alpha testing.
