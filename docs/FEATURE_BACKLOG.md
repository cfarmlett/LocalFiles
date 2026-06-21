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

## Planned

### MP-002: Natural Merge File Sorting

Sort newly selected Merge PDF files in natural numeric order, while preserving
manual reordering. This should make files such as `page-2.pdf` sort before
`page-10.pdf`.

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

### UX-007: Professional Interface Refresh

**Status:** Candidate

Refine visual hierarchy, spacing, typography, forms, button affordances,
workflow organization, mobile presentation, and overall interface cohesion.
The result should feel modern, calm, and credible for users handling important
documents while preserving LocalFiles' simple, trustworthy, utility-focused
identity rather than becoming a flashy redesign.

### PDF-THUMB-001: Shared Page Thumbnail Framework

**Status:** Candidate

**Priority:** High

Create a reusable, in-browser page thumbnail system for Split PDF, Reorder
Pages, Rotate Pages, Delete Pages, and future page-based tools such as
redaction. It should keep documents local, provide meaningful context for
text-heavy pages, and remain usable on mobile. This is shared foundation for
later preview and visual-editing features, not an isolated workflow.

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

### PDF Sanitization and Verification

**Status:** Candidate

Offer a dedicated workflow for removing supported hidden information such as
metadata, comments, annotations, attachments, forms, or scripts, accompanied by
an honest summary of what was checked and removed.

This would extend—not overstate—the current Metadata Removal tool.

### File Conversion Tools

**Status:** Candidate

Evaluate focused local workflows such as PDF to images, images to PDF, text
extraction, and PDF compression. Each workflow should be considered separately
based on user value, output quality, and browser cost. See the
[file conversion investigation](investigations/file-conversion.md).

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

### Safe PDF Redaction

**Status:** Investigating

Permanently remove selected information and provide understandable verification
of the resulting file. The current browser stack does not meet the project's
redaction standard; see the
[redaction investigation](investigations/redaction.md).

Potential user-visible extensions include search-assisted and pattern-assisted
candidate selection, but user review and conservative claims remain mandatory.

### Desktop Application

**Status:** Deferred

Package local workflows in a desktop application when browser limits or demand
justify the additional distribution, signing, update, and platform burden. See
the [desktop application investigation](investigations/desktop-app.md).

### AI-Assisted Document Tools

**Status:** Investigating

Explore optional capabilities such as summaries, classification, extraction,
and question answering. Any proposal must define where models run, what data
leaves the device, what users are told, and whether a genuinely local option is
practical.

See the [AI features investigation](investigations/ai-features.md).

## Where Other Information Goes

- Shipped features: `docs/RELEASE_HISTORY.md` and `CHANGELOG.md`
- Major direction: `ROADMAP.md`
- Technical decisions: `docs/decisions`
- Feasibility research: `docs/investigations`
- Implementation tasks: issue tracker or a short-lived task brief
