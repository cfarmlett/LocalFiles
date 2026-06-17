# LocalDocs Feature Backlog

Ideas worth preserving for future evaluation.

Inclusion in this backlog does not imply approval, scheduling, or commitment.

Status values:

* Backlog
* Considering
* Planned
* Deferred
* Rejected
* Implemented

---

# Reorder Pages

## RP-001: Reset Page Order

Status: Planned

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

* Should restore the original page order only.
* Should not require reloading the PDF.
* Should clear any generated output PDF, consistent with other workflow state changes.
* Simple usability enhancement with low implementation complexity.

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

* Could reuse concepts from Split PDF custom range parsing.
* Should validate page references.
* Should clearly preview the resulting order before generating output.
* May eventually support drag-and-drop, but this feature would remain useful even if drag-and-drop is added.
* Particularly valuable for large documents (50+ pages).

Potential Future Enhancement:
Allow importing an entire page ordering sequence generated externally or pasted from another tool.

---

## RP-003: Drag-and-Drop Page Reordering

Status: Planned

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

* Should coexist with Move Up / Move Down controls initially.
* Move Up / Move Down remains valuable for keyboard accessibility and precise adjustments.
* Should preserve existing output-generation workflow and validation behavior.
* Should clear generated output when page order changes, consistent with other workflow state changes.
* Should support large documents reasonably well.
* Accessibility considerations should be evaluated before implementation.

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

* Intended for simple document transformation workflows.
* Applicable to Split PDF, Merge PDF, Reorder Pages, Rotate Pages, Remove Pages, Remove Metadata, Compress PDF, and similar tools.
* Processing indicators should remain visible while work is in progress.
* Some tools may still require a review or preview stage before export.
* Export action naming should remain consistent across the application.

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

* Export actions should appear in consistent locations.
* Export terminology should remain consistent across tools.
* Processing states should behave consistently.
* Success states should behave consistently.
* New tools should follow the established export model unless a documented exception exists.

Potential Future Enhancement:
Create formal design-system guidelines covering workflow completion patterns across the entire application.

---

## RP-004: Rotation Button Iconography

Status: Planned

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

* Icons should supplement text rather than replace it.
* Should remain fully accessible to keyboard and screen-reader users.
* Should use widely recognized clockwise and counterclockwise rotation symbols.
* Should be applied consistently anywhere page rotation controls appear.

Potential Future Enhancement:
Display the current page rotation state directly within the page thumbnail or page list.

## UX-003: Persistent Export Result Panel

Status: Planned

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

* Should appear after successful document generation.
* Should clearly indicate success or failure.
* Should provide an obvious Download action.
* Should remain available until the document configuration changes or a new export is generated.
* Should work consistently across all document-processing tools.
* May reduce the need for automatic download behavior in some workflows.
* Could coexist with configurable export preferences.

Potential Future Enhancement:
Expand the result panel to support:

* Multiple generated files.
* ZIP exports.
* Batch processing results.
* Export history within the current session.
* File statistics (size, page count, processing time).
* Direct integration with future desktop application workflows.

## UX-004: Clear Loaded Document

Status: Planned

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

* Should remove the loaded document from the current feature only.
* Should clear generated output associated with that document.
* Should reset feature-specific state to its initial condition.
* Should not affect documents loaded into other features.
* Should be visually obvious and easy to discover.

Potential Future Enhancement:
Allow replacing the loaded document directly through a "Replace Document" action without requiring a separate clear step.

## UX-005: Collapsible Feature Content

Status: Planned

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

* Collapse state should preserve loaded documents and current work.
* Users should be able to expand sections without losing changes.
* Collapsed sections should clearly indicate whether a document is loaded.
* Consider displaying summary information while collapsed.

Example collapsed header:

▶ Reorder Pages (example.pdf, 100 pages)

* Should work consistently across all applicable features.

Potential Future Enhancement:
Provide global "Collapse All" and "Expand All" actions for managing multiple loaded documents simultaneously.


# Merge PDF

Reserved for MP-xxx entries.

---

# Split PDF

Reserved for SP-xxx entries.

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

