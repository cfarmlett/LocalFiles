# LocalDocs Feature Backlog

Ideas worth preserving for future evaluation.

Inclusion in this backlog does not imply approval, scheduling, or commitment.

Status values:

- Backlog
- Considering
- Planned
- Deferred
- Rejected
- Implemented

---

# Reorder Pages

## RP-001: Reset Page Order

Status: Implemented

Description:
Add a Reset button that restores the page list to its original document order.

Example:

Current order:

3, 4, 5, 1, 2

After Reset:

1, 2, 3, 4, 5

Motivation:
Users may experiment with page ordering and want a quick way to return to the original document structure without manually undoing changes.

Notes:

- Should restore the original page order only.
- Should not require reloading the PDF.
- Should clear any generated output PDF, consistent with other workflow state changes.
- Simple usability enhancement with low implementation complexity.

---

## RP-002: Advanced Page Ordering Input

Status: Backlog

Description:
Allow users to specify page order using page-range syntax instead of manually moving pages.

Example:

Input:

5-10, 11-20, 1-4

Resulting order:

5, 6, 7, 8, 9, 10,
11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
1, 2, 3, 4

Additional examples:

2, 1, 3-10

10-1

5-10, 1-4, 11-20

Motivation:
Manual movement becomes cumbersome for large PDFs.

For many reordering operations, expressing the desired order as ranges is dramatically faster and more precise than repeated Move Up / Move Down actions.

Notes:

- Could reuse concepts from Split PDF custom range parsing.
- Should validate page references.
- Should clearly preview the resulting order before generating output.
- May eventually support drag-and-drop, but this feature would remain useful even if drag-and-drop is added.
- Particularly valuable for large documents (50+ pages).

Potential Future Enhancement:
Allow importing an entire page ordering sequence generated externally or pasted from another tool.

---

## RP-003: Drag-and-Drop Page Reordering

Status: Implemented

Description:
Allow users to reorder pages by dragging page rows directly within the page list.

Example:

Current:

1
2
3
4
5

Drag page 5 above page 1

Result:

5
1
2
3
4

Motivation:
Move Up / Move Down controls become inefficient when moving pages long distances.

Drag-and-drop provides a faster and more intuitive workflow for many common reordering tasks.

Notes:

- Should coexist with Move Up / Move Down controls initially.
- Move Up / Move Down remains valuable for keyboard accessibility and precise adjustments.
- Should preserve existing output-generation workflow and validation behavior.
- Should clear generated output when page order changes, consistent with other workflow state changes.
- Should support large documents reasonably well.
- Accessibility considerations should be evaluated before implementation.

Potential Future Enhancement:
Multi-page drag-and-drop selection.

---

# User Experience

## UX-001: One-Step Export Workflow

Status: Backlog

Description:
Allow users to complete common document workflows using a single export action that both processes the document and downloads the resulting file.

Example:

Current workflow:

1. Make changes
2. Click Apply
3. Wait for processing
4. Click Download

Proposed workflow:

1. Make changes
2. Click Export PDF
3. Processing occurs
4. Download begins automatically

Motivation:
For most document operations, the user's actual goal is obtaining the modified file. Requiring a separate Apply step and Download step introduces unnecessary friction without providing significant value.

Notes:

- Intended for simple document transformation workflows.
- Applicable to Split PDF, Merge PDF, Reorder Pages, Rotate Pages, Remove Pages, Remove Metadata, Compress PDF, and similar tools.
- Processing indicators should remain visible while work is in progress.
- Some tools may still require a review or preview stage before export.
- Export action naming should remain consistent across the application.

Potential Future Enhancement:
Allow advanced workflows to optionally expose both Preview and Export actions when intermediate review is beneficial.

---

## UX-002: Consistent Export Experience

Status: Backlog

Description:
Establish a consistent export workflow and terminology across all LocalDocs tools.

Example:

Preferred workflow:

1. Configure document changes
2. Export PDF
3. Processing occurs
4. Download begins

Motivation:
Users should not need to learn a different completion workflow for every tool. Consistent export behavior reduces confusion and makes the application feel more polished and predictable.

Notes:

- Export actions should appear in consistent locations.
- Export terminology should remain consistent across tools.
- Processing states should behave consistently.
- Success states should behave consistently.
- New tools should follow the established export model unless a documented exception exists.

Potential Future Enhancement:
Create formal design-system guidelines covering workflow completion patterns across the entire application.

---

## RP-004: Rotation Button Iconography

Status: Backlog

Description:
Add rotation icons to page rotation controls in addition to text labels.

Example:

Current:

Rotate Left
Rotate Right

Proposed:

↺ Rotate Left
↻ Rotate Right

Motivation:
Rotation is inherently visual. Adding standard rotation icons improves recognition, reduces ambiguity, and makes the controls easier to scan.

Notes:

- Icons should supplement text rather than replace it.
- Should remain fully accessible to keyboard and screen-reader users.
- Should use widely recognized clockwise and counterclockwise rotation symbols.
- Should be applied consistently anywhere page rotation controls appear.

Potential Future Enhancement:
Display the current page rotation state directly within the page thumbnail or page list.

## UX-003: Persistent Export Result Panel

Status: Implemented

Description:
Display a persistent export result panel after document processing completes, allowing users to interact with the generated output without immediately triggering a download.

Example:

After export:

✓ PDF Generated

Download PDF

Open PDF

Copy File Name

Generate Again

Motivation:
Automatically downloading files immediately after processing is convenient for some users but can feel disruptive for others.

A persistent result panel gives users more control over what happens next while keeping the generated document readily available. It also provides a foundation for more advanced workflows as LocalDocs grows.

Notes:

- Should appear after successful document generation.
- Should clearly indicate success or failure.
- Should provide an obvious Download action.
- Should remain available until the document configuration changes or a new export is generated.
- Should work consistently across all document-processing tools.
- May reduce the need for automatic download behavior in some workflows.
- Could coexist with configurable export preferences.

Potential Future Enhancement:
Expand the result panel to support:

- Multiple generated files.
- ZIP exports.
- Batch processing results.
- Export history within the current session.
- File statistics (size, page count, processing time).
- Direct integration with future desktop application workflows.

## UX-004: Clear Loaded Document

Status: Implemented

Description:
Allow users to remove the currently loaded document from a feature without refreshing the page.

Example:

Loaded:

example.pdf (100 pages)

[Clear Document]

Result:

No document loaded.

Motivation:
Users may accidentally load the wrong file, wish to start over, or want to reduce page clutter after completing an operation.

Currently, resetting a feature may require reloading the page or manually navigating around large page lists.

Notes:

- Should remove the loaded document from the current feature only.
- Should clear generated output associated with that document.
- Should reset feature-specific state to its initial condition.
- Should not affect documents loaded into other features.
- Should be visually obvious and easy to discover.

Potential Future Enhancement:
Allow replacing the loaded document directly through a "Replace Document" action without requiring a separate clear step.

## UX-005: Collapsible Feature Content

Status: Implemented

Description:
Allow users to collapse and expand feature content areas to reduce scrolling and improve navigation when working with large documents.

Example:

▼ Reorder Pages
(100 page rows visible)

becomes

▶ Reorder Pages
(Content hidden)

Motivation:
Large documents can generate extensive page lists that significantly increase page length.

When multiple features contain loaded documents, users may need to scroll through hundreds of rows to reach other sections of the application.

Collapsible sections improve navigation and reduce visual clutter.

Notes:

- Collapse state should preserve loaded documents and current work.
- Users should be able to expand sections without losing changes.
- Collapsed sections should clearly indicate whether a document is loaded.
- Consider displaying summary information while collapsed.

Example collapsed header:

▶ Reorder Pages (example.pdf, 100 pages)

- Should work consistently across all applicable features.

Potential Future Enhancement:
Provide global "Collapse All" and "Expand All" actions for managing multiple loaded documents simultaneously.

# FN-001: Filename Hygiene Pass

## Status

Backlog

## Priority

Low

## Context

LocalDocs currently generates workflow-specific output filenames such as:

```text
document-merged.pdf
document-metadata-removed.pdf
document-page-1.pdf
```

Most current naming behavior is acceptable, but several edge cases may produce awkward or inconsistent filenames over time.

Metadata Removal now avoids stacking the `-metadata-removed` suffix. Broader
filename hygiene remains backlog work.

Examples:

```text
document-metadata-removed-metadata-removed.pdf
document-compressed-compressed.pdf
document-merged-merged.pdf
```

These cases do not break functionality but reduce polish.

This item is intentionally focused on filename quality and consistency.

It is not intended to redesign workflow behavior.

---

## Goals

Improve consistency, readability, and predictability of generated filenames.

Prevent common filename-quality issues without introducing a complex naming framework.

---

## Candidate Improvements

### Duplicate Suffix Prevention

Ensure operation suffixes are idempotent.

Examples:

```text
document-metadata-removed.pdf
+ metadata removal
→ document-metadata-removed.pdf
```

not:

```text
document-metadata-removed-metadata-removed.pdf
```

Similarly:

```text
document-compressed.pdf
+ compression
→ document-compressed.pdf
```

not:

```text
document-compressed-compressed.pdf
```

---

### Shared Filename Helper

Consider introducing a small shared helper:

```ts
appendFilenameSuffix(filename, suffix);
```

Responsibilities:

- preserve file extension
- append suffix when absent
- avoid duplicate suffixes
- produce deterministic filenames

The helper should remain lightweight.

Avoid creating a large filename-management subsystem.

---

### Consistent Output Naming

Review output naming conventions across workflows:

- Merge
- Split
- Reorder
- Rotate
- Delete Pages
- Metadata Removal
- Future Compress workflow
- Split ZIP export workflow

Ensure naming patterns are predictable.

Examples:

```text
document-merged.pdf
document-reordered.pdf
document-rotated.pdf
document-metadata-removed.pdf
```

---

### Split Output Naming Review

Review:

```text
document-page-1.pdf
document-pages-1-5.pdf
```

for consistency and readability.

No redesign required unless a clear issue is found.

---

### Long Filename Handling

Consider whether repeated operations can create excessively long filenames.

Examples:

```text
document-reordered-rotated-compressed-metadata-removed.pdf
```

No solution required today, but the issue should be evaluated.

---

### Reserved Character Handling

Verify generated filenames remain valid across supported platforms and browsers.

---

## Out of Scope

Do not:

- Change workflow behavior.
- Change export architecture.
- Introduce user-configurable naming templates.
- Introduce localization/internationalization work.
- Introduce server-side naming.
- Create a large filename management system.
- Block valid operations solely because they would generate a duplicate filename.

---

## Success Criteria

- Duplicate suffixes are prevented.
- Filename generation remains deterministic.
- Existing workflows continue functioning.
- Output filenames remain readable and predictable.
- No LocalDocs privacy guarantees are affected.

---

## Notes

This is a polish item.

User-facing workflow friction, validation, and document-processing correctness should generally take priority over filename aesthetics.

# Merge PDF

## MP-001: Drag-and-Drop Merge File Reordering

Status: Backlog

Description:
Allow users to reorder selected Merge PDF files by dragging file rows.

Motivation:
Merge already depends on selected-file order. Drag-and-drop would make
long-distance file movement faster while preserving existing Move Up / Move
Down controls for keyboard access.

Notes:

- Separate from RP-003, which applies only to pages inside Reorder Pages.
- Should preserve current merge output and stale-output invalidation behavior.
- Should not introduce a large drag-and-drop dependency.

---

# Split PDF

## SP-001: ZIP Export for Split PDF

Status: Implemented

Description:
Add a local ZIP download option when Split PDF produces multiple output files.

Motivation:
Split can produce many PDFs. ZIP export would make multi-output downloads easier
without changing LocalDocs' local-only processing model.

Notes:

- ZIP export is local-only and generated from existing Split outputs.
- Individual PDF downloads remain available.
- Single-output Split results do not show ZIP export.
- ZIP export includes stale-output guards and ZIP32 limit checks.
- No cloud processing, upload path, telemetry, or new dependency is required.

---

# Redaction

Reserved for RD-xxx entries.

---

# Metadata

Reserved for MD-xxx entries.

---

# OCR

Reserved for OCR-xxx entries.

---

# Platform

Reserved for PLAT-xxx entries.

---

# Trust & Transparency

Reserved for TT-xxx entries.

---

# Release Readiness

## V15-001: Final V1.5 Review And Feedback Release

Status: Backlog

Description:
Perform final V1.5 release review/testing and prepare a friends-and-family
feedback release.

Motivation:
V1.5 is intended to improve polish and confidence before early external
feedback. A focused review should confirm that completed UX and workflow polish
holds together across the app.

Notes:

- Should verify privacy/local-only behavior remains intact.
- Should run the full local validation suite.
- Should collect early tester feedback before expanding scope.
