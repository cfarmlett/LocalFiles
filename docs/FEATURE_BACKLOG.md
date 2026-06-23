# LocalFiles Feature Backlog

This backlog preserves user-visible capabilities worth considering. Inclusion
does not imply approval, scheduling, or commitment.

A candidate belongs here only if completing it could reasonably produce a
release-note entry. Implementation sketches, architecture choices, release
chores, and completed work belong elsewhere.

Statuses:

- **Planned**: selected for the next suitable implementation window.
- **Candidate**: useful idea that has not been scheduled.
- **Investigating**: blocked on feasibility, trust, or product research.
- **Deferred**: intentionally postponed until the product or architecture
  matures.

## Workflow Improvements

### RP-002: Advanced Page Ordering Input

**Status:** Candidate

Allow users to describe a page order with page and range syntax, such as
`5-10,11-20,1-4`, with a clear preview before export.

### MP-001: Drag-and-Drop Merge Reordering

**Status:** Candidate

Allow selected Merge PDF files to be reordered by dragging while retaining
keyboard-accessible controls.

### UX-001: Streamlined Export Flow

**Status:** Candidate

Make processing, success feedback, and download actions consistent across tools
so users do not have to learn a different completion flow for each workflow.

### FN-001: Consistent Output Filenames

**Status:** Candidate

Make generated filenames predictable across workflows, avoid repeated
operation suffixes, and handle long or awkward source names cleanly.

### RP-004: Clearer Rotation Controls

**Status:** Candidate

Add recognizable rotation cues alongside text labels without reducing keyboard
or screen-reader accessibility.

### PDF-THUMB-001: Shared Page Thumbnail Framework

**Status:** Candidate

**Priority:** High

Create a reusable, in-browser page thumbnail system for Split PDF, Reorder
Pages, Rotate Pages, Delete Pages, and future page-based tools such as
redaction. It should keep documents local, provide meaningful context for
text-heavy pages, and remain usable on mobile. This is shared foundation for
later inspection, preview, and visual-editing features, not an isolated
workflow or visual-polish task.

### PDF-THUMB-002: Expanded Page Preview Viewer

**Status:** Candidate

**Priority:** Medium

Let users open a thumbnail in a larger, readable preview with next/previous
navigation and practical zoom controls. Reuse the viewer across page-based
workflows so users can inspect page contents without opening an external PDF
viewer.

**Depends on:** PDF-THUMB-001

### SPLIT-002: Visual Split Point Editor

**Status:** Candidate

**Priority:** Medium-High

Show pages in order and let users click or tap between previews to add or
remove split points. Generate outputs from those boundaries so users do not
have to calculate ranges manually.

**Depends on:** PDF-THUMB-001; PDF-THUMB-002 may enhance the workflow.

### SPLIT-003: Thumbnail-Assisted Custom Ranges

**Status:** Candidate

**Priority:** Low

Keep visual selections and Custom Ranges synchronized in both directions so
users can switch between visual editing and precise range input without losing
context.

**Depends on:** PDF-THUMB-001

## New Local Capabilities

### DOC-INSPECT-001: Document Inspection

**Status:** Investigating

Investigate whether LocalFiles can reliably inventory sensitive or hidden PDF
features before modification, including standard metadata, XMP, attachments,
annotations and comments, forms, scripts and actions, optional content and
layers, OCR text layers, signatures, structure data, and suspicious residual
objects.

The result should help users understand what is present and establish evidence
for later sanitization or redaction decisions.

### PDF-SAN-001: Verifiable Sanitization

**Status:** Investigating

Investigate a sanitization workflow that reports what was found, what was
removed, what failed, what was not checked, and what residual risks remain.
The result should include a clear human-readable report and may also provide a
machine-readable verification receipt.

This would extend—not overstate—the current Metadata Removal tool.

**Depends on:** DOC-INSPECT-001 or an equivalent inspection model.

### File Conversion Tools

**Status:** Deferred

Evaluate focused local workflows such as PDF to images, images to PDF, text
extraction, and PDF compression. Each workflow should be considered separately
based on user value, output quality, browser cost, and fit with a complete
LocalFiles workflow. A broad conversion catalog is not a primary
differentiation strategy. See the [file conversion investigation](investigations/file-conversion.md).

### Batch Processing

**Status:** Deferred

Apply supported operations to multiple files in one local workflow. Batch work
should follow validation of the single-document experience and browser resource
limits.

### Local OCR

**Status:** Investigating

Make scanned documents searchable or extractable without uploading them.
Engine size, language support, accuracy, accessibility, and browser performance
need research before scheduling; see the [OCR investigation](investigations/ocr.md).
Standalone OCR is a lower priority than OCR that supports inspection,
accessibility, sanitization, or redaction assurance.

### PDF-REDACT-001: Redaction Assurance

**Status:** Investigating

Investigate what would be required to make an honest, explicit guarantee that
selected content is gone. The model must combine destructive redaction with
independent verification and adversarial fixtures covering text extraction,
object scanning, OCR and images, annotations, metadata, attachments, and other
hidden content.

The current browser stack does not meet this standard. Any future workflow must
define guarantee levels and explain what each level does and does not cover;
see the [redaction investigation](investigations/redaction.md).

Potential user-visible extensions include search-assisted and pattern-assisted
candidate selection, but user review and conservative claims remain mandatory.

### Desktop Application

**Status:** Deferred

Package local workflows in a desktop application when browser limits or demand
justify the additional distribution, signing, update, and platform burden. See
the [desktop application investigation](investigations/desktop-app.md).

### AI-Assisted Document Tools

**Status:** Deferred

Explore optional capabilities such as summaries, classification, extraction,
and question answering. Any proposal must define where models run, what data
leaves the device, what users are told, and whether a genuinely local option is
practical. These tools are a lower near-term priority than core workflow
quality and verifiable document-safety work.

See the [AI features investigation](investigations/ai-features.md).

## Where Other Information Goes

- Shipped features: `docs/RELEASE_HISTORY.md` and `CHANGELOG.md`
- Major direction: `ROADMAP.md`
- Technical decisions: `docs/decisions`
- Feasibility research: `docs/investigations`
- Implementation tasks: issue tracker or a short-lived task brief
